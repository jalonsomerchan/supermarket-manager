import { choice, rand, tileCenter } from "../utils/math.js";
import { findPath } from "../utils/pathfinding.js";
import { adjacentOpenTiles, canStand, tileAt } from "../systems/world.js";
import { addReputation, ownedProductIds } from "../systems/economy.js";

let nextId = 1;

export class Customer {
  constructor(config, state, blocked) {
    this.id = nextId++;
    this.config = config;
    this.state = "shopping";
    this.dir = "up";
    this.frame = 0;
    this.anim = 0;
    this.timer = 0;
    this.bubble = "cart";
    this.cart = [];
    this.list = this.makeList(state);
    this.wishlist = [...this.list];
    this.x = config.map.entrance.x * config.tile + config.tile / 2;
    this.y = config.map.entrance.y * config.tile + config.tile / 2;
    this.path = [];
    this.pause = 0;
    this.targetShelf = null;
    this.chooseNextShelf(state, blocked);
  }

  makeList(state) {
    const ids = ownedProductIds(state).filter((id) => state.shelves.some((shelf) => shelf.productId === id));
    return Array.from({ length: Math.ceil(rand(1, 3)) }, () => choice(ids));
  }

  update(dt, game) {
    this.anim += dt * (this.state === "angry" ? 14 : 7);
    this.frame = Math.floor(this.anim) % 4;
    if (this.state === "inspect") return this.inspect(dt, game);
    if (this.state === "checkout") return this.updateCheckout(dt, game);
    if (this.state === "queue") return this.waitQueue(dt, game);
    if (this.state === "done") return;
    if (this.pause > 0) {
      this.pause -= dt;
      return;
    }
    this.followPath(dt, game);
  }

  followPath(dt, game) {
    if (!this.path.length) {
      if (this.state === "shopping") this.state = "inspect";
      if (this.state === "toQueue") {
        this.state = "queue";
        this.timer = this.config.world.queuePatienceSeconds;
      }
      if (this.state === "leaving" || this.state === "angry") this.state = "done";
      return;
    }
    const target = tileCenter(this.path[0], this.config.tile);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const length = Math.hypot(dx, dy);
    const speed = this.state === "angry" ? this.config.customer.angrySpeed : this.config.customer.speed;
    if (length < speed * dt) {
      this.x = target.x;
      this.y = target.y;
      this.path.shift();
      if (this.path.length && Math.random() < this.config.customer.wanderPauseChance) this.pause = rand(0.08, 0.22);
    } else {
      this.x += (dx / length) * speed * dt;
      this.y += (dy / length) * speed * dt;
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
    }
  }

  inspect(dt, game) {
    this.timer += dt;
    if (this.timer < this.config.world.inspectSeconds) return;
    this.timer = 0;
    const productId = this.list[0];
    const shelf = this.targetShelf;
    const product = game.state.products[productId];
    if (!shelf || shelf.stock <= 0) {
      if (this.chooseStockedShelf(game.state, game.blocked)) {
        this.state = "shopping";
        this.bubble = "cart";
        return;
      }
      return this.fail(game, "empty");
    }
    if (product.basePrice > product.basePriceRecommended * this.config.customer.overpriceSoftLimit) return this.fail(game, "price");
    shelf.stock -= 1;
    this.list.shift();
    this.cart.push(productId);
    this.bubble = "cart";
    if (shelf.stock === 0 && !game.state.stockWarnings[productId]) {
      game.state.stockWarnings[productId] = true;
      game.state.messages.push({ text: `Se te ha acabado ${product.name}.`, type: "warn" });
    }
    if (this.list.length) this.chooseNextShelf(game.state, game.blocked);
    else this.goQueue(game);
  }

  fail(game, reason) {
    this.bubble = reason === "price" ? "coin" : "empty";
    if (reason === "empty" && this.targetShelf) {
      const productId = this.targetShelf.productId;
      const product = game.state.products[productId];
      if (!game.state.stockWarnings[productId]) {
        game.state.stockWarnings[productId] = true;
        game.state.messages.push({ text: `Se te ha acabado ${product.name}.`, type: "warn" });
      }
    }
    this.state = "angry";
    game.state.lost += 1;
    addReputation(game.state, reason === "price" ? -18 : -8, game.config);
    this.pathTo(game.config.map.exit, game);
  }

  waitQueue(dt, game) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.bubble = "hourglass";
      this.state = "angry";
      game.state.lost += 1;
      addReputation(game.state, -10, game.config);
      this.pathTo(game.config.map.exit, game);
    }
  }

  startCheckout(game) {
    if (this.state === "checkout") return;
    this.state = "checkout";
    this.checkoutDuration = game.state.upgrades.scanner ? this.config.world.checkoutSeconds / 2 : this.config.world.checkoutSeconds;
    this.timer = this.checkoutDuration;
    this.bubble = "checkout";
    game.toast("Cobrando cliente...", "info");
  }

  updateCheckout(dt, game) {
    this.timer -= dt;
    if (this.timer > 0) return;
    const total = this.cart.reduce((sum, id) => sum + game.state.products[id].basePrice, 0);
    game.state.money += total;
    game.state.gross += total;
    game.state.served += 1;
    addReputation(game.state, 9, game.config);
    game.state.messages.push({ text: `Cliente cobrado: $${total.toFixed(2)}.`, type: "success" });
    this.state = "leaving";
    this.bubble = "paid";
    this.pathTo(game.config.map.exit, game);
    game.ui.openCheckoutSummary(this.cart, total);
  }

  chooseNextShelf(state, blocked) {
    return this.chooseShelf(state, blocked, false);
  }

  chooseStockedShelf(state, blocked) {
    return this.chooseShelf(state, blocked, true);
  }

  chooseShelf(state, blocked, requireStock) {
    const productId = this.list[0];
    const candidate = this.findShelfCandidate(productId, state, blocked, requireStock);
    if (!candidate) {
      this.targetShelf = null;
      this.path = [];
      return false;
    }
    this.targetShelf = candidate.shelf;
    this.path = candidate.path;
    return true;
  }

  findShelfCandidate(productId, state, blocked, requireStock) {
    const start = tileAt(this, this.config.tile);
    return state.shelves
      .filter((shelf) => shelf.productId === productId && (!requireStock || shelf.stock > 0))
      .flatMap((shelf) => this.reachableShelfGoals(shelf, start, blocked))
      .sort((a, b) => a.path.length - b.path.length || a.shelf.id - b.shelf.id)[0];
  }

  reachableShelfGoals(shelf, start, blocked) {
    return adjacentOpenTiles(shelf, blocked, this.config)
      .map((goal) => ({ shelf, goal, path: this.findPathToGoal(start, goal, blocked) }))
      .filter(({ goal, path }) => path.length || (start.x === goal.x && start.y === goal.y));
  }

  findPathToGoal(start, goal, blocked) {
    return findPath(start, goal, (tile) => canStand(tile, blocked, this.config), this.config.world.cols, this.config.world.rows);
  }

  goQueue(game) {
    const register = game.config.map.registers[0];
    const taken = game.state.customers.filter((c) => c.state === "queue" || c.state === "checkout").length;
    const goal = register.queue[Math.min(taken, register.queue.length - 1)];
    this.register = register;
    this.state = "toQueue";
    this.pathTo(goal, game);
  }

  pathTo(goal, game) {
    const start = tileAt(this, this.config.tile);
    this.path = findPath(start, goal, (tile) => canStand(tile, game.blocked, this.config), this.config.world.cols, this.config.world.rows);
  }
}
