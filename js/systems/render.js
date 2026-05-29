import { clamp } from "../utils/math.js";

const tileColor = {
  floor: "#d8cfa8",
  warehouse: "#64666f",
  wall: "#423547"
};

export class Renderer {
  constructor(canvas, config, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.config = config;
    this.assets = assets;
    this.playerPreview = { x: 0, y: 0, tile: { x: 0, y: 0 } };
    this.doorRect = { ...config.map.entrance, w: 2, h: 1 };
    this.ghostShelf = { x: 0, y: 0, w: 1, h: 2, productId: null, stock: 0 };
  }

  render(game) {
    const ctx = this.ctx;
    this.currentState = game.state;
    this.updatePlayerPreview(game.player, game.state);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMap(game.state);
    this.drawObjects(game.state);
    this.drawActors(game.state.customers, game.player);
    this.drawBubbles(game.state.customers);
  }

  updatePlayerPreview(player, state) {
    const preview = this.playerPreview;
    const offset = player.dir === "down"
      ? downOffset
      : player.dir === "up"
        ? upOffset
        : player.dir === "left"
          ? leftOffset
          : rightOffset;
    preview.x = player.x;
    preview.y = player.y;
    preview.tile.x = Math.floor(player.x / this.config.tile) + offset.x;
    preview.tile.y = Math.floor(player.y / this.config.tile) + offset.y;
    state.playerPreview = preview;
  }

  drawActors(customers, player) {
    let playerDrawn = false;
    for (const customer of customers) {
      if (!playerDrawn && player.y <= customer.y) {
        this.drawActor(player);
        playerDrawn = true;
      }
      this.drawActor(customer);
    }
    if (!playerDrawn) this.drawActor(player);
  }

  drawMap(state) {
    const { ctx, config } = this;
    for (let y = 0; y < config.world.rows; y++) {
      for (let x = 0; x < config.world.cols; x++) {
        ctx.fillStyle = inRects(x, y, config.map.warehouseTiles) ? tileColor.warehouse : tileColor.floor;
        ctx.fillRect(x * config.tile, y * config.tile, config.tile, config.tile);
        ctx.strokeStyle = "#b7ab85";
        ctx.strokeRect(x * config.tile, y * config.tile, config.tile, config.tile);
      }
    }
    for (const wall of config.map.walls) this.wall(wall);
    if (!state.expansionLevel) {
      for (const wall of config.map.expansionWalls || []) this.wall(wall);
      this.lockedZone();
    }
    this.prop(this.assets.images.door, this.doorRect, 2, 1);
  }

  drawObjects(state) {
    const { config } = this;
    if (!this.isMoving(state, "office", 0)) this.prop(this.assets.images.computer, config.map.office, 2, 1);
    for (const [index, recycle] of state.recycles.entries()) {
      if (!this.isMoving(state, "recycle", index)) this.block(recycle, "#319c83", "REC");
    }
    for (const [index, register] of config.map.registers.entries()) {
      if (!this.isMoving(state, "register", index)) this.prop(this.assets.images.register, register, 2, 1);
    }
    for (const [index, pallet] of state.pallets.entries()) {
      if (this.isMoving(state, "pallet", index)) continue;
      this.propTile(this.assets.images.pallet, pallet.x, pallet.y, 1, 1);
      pallet.boxes.forEach((box, index) => this.box(pallet.x, pallet.y - index * 0.28, state.products[box.productId].color));
    }
    for (const box of state.droppedBoxes) this.box(box.x, box.y, state.products[box.productId].color);
    for (const shelf of state.shelves) {
      if (!this.isMoving(state, "shelf", shelf.id)) this.shelf(shelf, state.products[shelf.productId]);
    }
    this.movingGhost(state);
  }

  drawActor(actor) {
    const image = actor.constructor.name === "Player" ? this.assets.images.player : this.assets.images.customer;
    const s = this.config.sprites;
    const row = s.directions[actor.dir] ?? 0;
    this.ctx.drawImage(
      image,
      actor.frame * s.frameSize,
      row * s.frameSize,
      s.frameSize,
      s.frameSize,
      actor.x - 27,
      actor.y - 48,
      54,
      54
    );
    if (actor.carry) this.drawCarry(actor);
  }

  drawCarry(actor) {
    const product = actor.carry.productId ? this.currentState?.products[actor.carry.productId] : null;
    this.ctx.fillStyle = actor.carry.empty ? "#b38452" : product?.color || "#d19854";
    this.ctx.fillRect(actor.x - 12, actor.y - 34, 24, 14);
    this.ctx.strokeStyle = "#5c3b24";
    this.ctx.strokeRect(actor.x - 12, actor.y - 34, 24, 14);
    if (product) {
      this.ctx.fillStyle = "#201820";
      this.ctx.font = "bold 7px Courier New";
      this.ctx.textAlign = "center";
      this.ctx.fillText(product.name.slice(0, 4).toUpperCase(), actor.x, actor.y - 24);
    }
  }

  drawBubbles(customers) {
    for (const customer of customers) {
      if (!customer.bubble || customer.state === "done") continue;
      if (customer.state === "queue") this.patience(customer);
      if (customer.state === "checkout") this.checkoutProgress(customer);
    }
  }

  dialogBubble(x, y, text, type) {
    const ctx = this.ctx;
    const width = Math.max(44, text.length * 7 + 14);
    const height = 20;
    const left = Math.round(x - width / 2);
    const top = Math.round(y - height / 2);
    const danger = type === "coin" || type === "empty" || type === "hourglass";
    ctx.fillStyle = danger ? "#fff0e1" : "#f8f1d2";
    ctx.fillRect(left, top, width, height);
    ctx.fillStyle = danger ? "#ef5d60" : "#2c2536";
    ctx.fillRect(left, top, width, 3);
    ctx.fillRect(left, top + height - 3, width, 3);
    ctx.fillRect(left, top, 3, height);
    ctx.fillRect(left + width - 3, top, 3, height);
    ctx.fillStyle = "#f8f1d2";
    ctx.fillRect(Math.round(x - 4), top + height - 1, 8, 5);
    ctx.fillStyle = danger ? "#8b1e2a" : "#1e1a22";
    ctx.font = "bold 9px Courier New";
    ctx.textAlign = "center";
    this.bubbleIcon(x - width / 2 + 12, top + 10, type);
    ctx.fillText(text, x + 6, top + 13);
  }

  bubbleIcon(x, y, type) {
    const ctx = this.ctx;
    ctx.fillStyle = type === "empty" || type === "coin" ? "#ef5d60" : "#4aa8ff";
    if (type === "cart") {
      ctx.fillRect(x - 5, y - 3, 9, 5);
      ctx.fillStyle = "#201820";
      ctx.fillRect(x - 3, y + 3, 2, 2);
      ctx.fillRect(x + 3, y + 3, 2, 2);
    } else if (type === "hourglass") {
      ctx.fillRect(x - 4, y - 5, 8, 2);
      ctx.fillRect(x - 4, y + 3, 8, 2);
      ctx.fillRect(x - 1, y - 2, 2, 4);
    } else {
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = "#fff6dc";
      ctx.fillRect(x - 1, y - 3, 2, 6);
    }
  }

  patience(customer) {
    const ratio = clamp(customer.timer / this.config.world.queuePatienceSeconds, 0, 1);
    this.ctx.fillStyle = "#2b1d24";
    this.ctx.fillRect(customer.x - 18, customer.y - 66, 36, 5);
    this.ctx.fillStyle = ratio < 0.3 ? "#ef5d60" : "#5ec66b";
    this.ctx.fillRect(customer.x - 18, customer.y - 66, 36 * ratio, 5);
  }

  checkoutProgress(customer) {
    const ratio = clamp(customer.timer / customer.checkoutDuration, 0, 1);
    this.ctx.fillStyle = "#2b1d24";
    this.ctx.fillRect(customer.x - 22, customer.y - 76, 44, 5);
    this.ctx.fillStyle = "#4aa8ff";
    this.ctx.fillRect(customer.x - 22, customer.y - 76, 44 * ratio, 5);
  }

  shelf(shelf, product) {
    const ratio = shelf.stock / product.shelfCapacity;
    this.prop(this.assets.images.shelf, shelf, 1, 2);
    const color = ratio <= 0 ? "#555" : product.color;
    const rows = Math.ceil(ratio * 4);
    for (let i = 0; i < rows; i++) {
      const y = shelf.y * this.config.tile + 8 + i * 11;
      for (let pack = 0; pack < 4; pack++) {
        const x = shelf.x * this.config.tile + 6 + pack * 5;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 4, 6);
        this.ctx.fillStyle = "#fff6dc";
        this.ctx.fillRect(x + 1, y + 1, 2, 1);
        this.ctx.fillStyle = "#201820";
        this.ctx.fillRect(x, y + 5, 4, 1);
      }
    }
    this.ctx.fillStyle = ratio === 0 ? "#ef5d60" : ratio < 0.3 ? "#f7c948" : "#5ec66b";
    this.ctx.fillRect(shelf.x * this.config.tile + 3, (shelf.y + shelf.h) * this.config.tile - 7, 26 * ratio, 4);
  }

  prop(image, rect, widthTiles, heightTiles) {
    this.propTile(image, rect.x, rect.y, widthTiles, heightTiles);
  }

  propTile(image, x, y, widthTiles, heightTiles) {
    const t = this.config.tile;
    this.ctx.drawImage(image, x * t, y * t, widthTiles * t, heightTiles * t);
  }

  block(rect, color, label = "") {
    const t = this.config.tile;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(rect.x * t, rect.y * t, rect.w * t, rect.h * t);
    this.ctx.strokeStyle = "#201820";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(rect.x * t + 2, rect.y * t + 2, rect.w * t - 4, rect.h * t - 4);
    if (label) {
      this.ctx.fillStyle = "#fff6dc";
      this.ctx.font = "14px Courier New";
      this.ctx.textAlign = "center";
      this.ctx.fillText(label, (rect.x + rect.w / 2) * t, (rect.y + rect.h / 2) * t + 5);
    }
  }

  wall(rect) {
    const t = this.config.tile;
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        this.ctx.drawImage(this.assets.images.wall, x * t, y * t, t, t);
      }
    }
  }

  lockedZone() {
    const t = this.config.tile;
    this.ctx.save();
    this.ctx.globalAlpha = 0.28;
    this.ctx.fillStyle = "#07050a";
    this.ctx.fillRect(14 * t, 4 * t, 5 * t, 10 * t);
    this.ctx.restore();
  }

  movingGhost(state) {
    const moving = state.movingObject;
    if (!moving) return;
    const t = this.config.tile;
    const tile = state.playerPreview?.tile || this.playerPreview.tile;
    const x = tile.x * t;
    const y = tile.y * t;
    this.placementTile(tile, moving.w, moving.h);
    this.ctx.save();
    this.ctx.globalAlpha = 0.65;
    if (moving.type === "shelf") {
      this.ghostShelf.x = tile.x;
      this.ghostShelf.y = tile.y;
      this.ghostShelf.productId = moving.ref.productId;
      this.ghostShelf.stock = moving.ref.stock;
      this.shelf(this.ghostShelf, state.products[moving.ref.productId]);
    }
    if (moving.type === "pallet") this.ctx.drawImage(this.assets.images.pallet, x, y, 32, 32);
    if (moving.type === "register") this.ctx.drawImage(this.assets.images.register, x, y, 64, 32);
    if (moving.type === "office") this.ctx.drawImage(this.assets.images.computer, x, y, 64, 32);
    if (moving.type === "recycle") this.block({ x: tile.x, y: tile.y, w: 1, h: 1 }, "#319c83", "REC");
    this.ctx.restore();
  }

  placementTile(tile, w, h) {
    const t = this.config.tile;
    this.ctx.save();
    this.ctx.globalAlpha = 0.35;
    this.ctx.fillStyle = "#4aa8ff";
    this.ctx.fillRect(tile.x * t, tile.y * t, w * t, h * t);
    this.ctx.globalAlpha = 1;
    this.ctx.strokeStyle = "#fff6dc";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(tile.x * t + 2, tile.y * t + 2, w * t - 4, h * t - 4);
    this.ctx.restore();
  }

  isMoving(state, type, id) {
    return state.movingObject?.type === type && state.movingObject.id === id;
  }

  box(x, y, color) {
    const t = this.config.tile;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * t + 7, y * t + 9, 18, 16);
    this.ctx.strokeStyle = "#4a2b16";
    this.ctx.strokeRect(x * t + 7, y * t + 9, 18, 16);
  }
}

const downOffset = { x: 0, y: 1 };
const upOffset = { x: 0, y: -1 };
const leftOffset = { x: -1, y: 0 };
const rightOffset = { x: 1, y: 0 };

function inRects(x, y, rects) {
  return rects.some((rect) => x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h);
}
