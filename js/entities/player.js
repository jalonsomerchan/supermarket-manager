import { clamp, distance, tileCenter } from "../utils/math.js";
import { nearbyRect, tileAt, canStand } from "../systems/world.js";

export class Player {
  constructor(config) {
    this.config = config;
    this.x = config.player.start.x * config.tile + config.tile / 2;
    this.y = config.player.start.y * config.tile + config.tile / 2;
    this.dir = "down";
    this.frame = 0;
    this.anim = 0;
    this.carry = null;
    this.scanTimer = 0;
  }

  update(dt, input, blocked) {
    const vector = input.vector();
    const moving = vector.x || vector.y;
    if (moving) {
      const len = Math.hypot(vector.x, vector.y);
      const speed = this.speed();
      const next = {
        x: this.x + (vector.x / len) * speed * dt,
        y: this.y + (vector.y / len) * speed * dt
      };
      if (Math.abs(vector.x) > Math.abs(vector.y)) this.dir = vector.x > 0 ? "right" : "left";
      else this.dir = vector.y > 0 ? "down" : "up";
      if (!blocked.has(`${tileAt(next, this.config.tile).x},${tileAt(next, this.config.tile).y}`)) {
        this.x = clamp(next.x, 16, this.config.world.cols * this.config.tile - 16);
        this.y = clamp(next.y, 16, this.config.world.rows * this.config.tile - 16);
      }
      this.anim += dt * 8;
      this.frame = Math.floor(this.anim) % 4;
    } else {
      this.frame = 0;
    }
  }

  speed() {
    const shoe = this.config.player.speed * 1.2;
    const base = this.upgrades?.shoes ? shoe : this.config.player.speed;
    return this.carry ? base * this.config.player.carryingSpeedFactor : base;
  }

  interactionTarget(game) {
    const { state, config } = game;
    for (const register of config.map.registers) {
      const spot = { x: register.x - 1, y: register.y, w: 1, h: 1 };
      if (nearbyRect(this, spot, config.tile) && state.customers.some((person) => person.state === "queue" && person.register === register)) {
        return { type: "checkout", label: "Cobrar cliente", ref: register, rect: spot };
      }
    }
    if (nearbyRect(this, { x: config.map.entrance.x, y: config.map.entrance.y, w: 2, h: 1 }, config.tile)) {
      return { type: "shop", label: state.phase === "closed" ? "Abrir tienda" : "Cerrar tienda", rect: { x: config.map.entrance.x, y: config.map.entrance.y, w: 2, h: 1 } };
    }
    const customer = this.nearCustomer(game);
    if (customer) return { type: "customer", label: "Ver cliente", ref: customer, x: customer.x, y: customer.y };
    if (nearbyRect(this, config.map.office, config.tile)) return { type: "office", label: "Abrir terminal", rect: config.map.office };
    for (const recycle of state.recycles) {
      if (nearbyRect(this, recycle, config.tile) && this.carry?.empty) return { type: "recycle", label: "Reciclar caja", ref: recycle, rect: recycle };
    }
    const dropped = state.droppedBoxes.find((box) => nearbyRect(this, { ...box, w: 1, h: 1 }, config.tile));
    if (dropped && !this.carry) return { type: "droppedBox", label: "Recoger caja", ref: dropped, rect: { ...dropped, w: 1, h: 1 } };
    for (const pallet of state.pallets) {
      const rect = { ...pallet, w: 1, h: 1 };
      if (nearbyRect(this, rect, config.tile) && !this.carry && pallet.boxes.length) return { type: "pallet", label: "Recoger caja", ref: pallet, rect };
      if (nearbyRect(this, rect, config.tile) && !this.carry && !pallet.boxes.length) return { type: "emptyPallet", label: "Pale vacio", ref: pallet, rect };
    }
    for (const shelf of state.shelves) {
      if (!nearbyRect(this, shelf, config.tile)) continue;
      const product = state.products[shelf.productId];
      const canRestock = this.carry && !this.carry.empty && this.carry.productId === shelf.productId && shelf.stock < product.shelfCapacity;
      return { type: "shelf", label: canRestock ? "Reponer estante" : "Estante", ref: shelf, rect: shelf };
    }
    return null;
  }

  interact(game) {
    const { state } = game;
    const target = this.interactionTarget(game);
    if (!target) return game.toast("Nada con lo que interactuar cerca.", "warn");
    if (target.type === "checkout") return this.checkout(game, target.ref);
    if (target.type === "shop") return game.toggleShop();
    if (target.type === "customer") return game.ui.openCustomerInfo(target.ref);
    if (target.type === "office") return game.ui.openTerminal();
    if (target.type === "recycle") {
      this.carry = null;
      return game.toast("Caja reciclada.", "success");
    }
    if (target.type === "droppedBox") {
      state.droppedBoxes = state.droppedBoxes.filter((box) => box !== target.ref);
      this.carry = { productId: target.ref.productId, units: target.ref.units, empty: false };
      return game.toast(`Caja recogida: ${state.products[target.ref.productId].name}.`, "success");
    }
    if (target.type === "pallet") {
      const box = target.ref.boxes.pop();
      this.carry = { productId: box.productId, units: this.boxCapacity(), empty: false };
      return game.toast(`Caja de ${state.products[box.productId].name}.`, "success");
    }
    if (target.type === "emptyPallet") return game.toast("No hay cajas para recoger en ese pale.", "warn");
    if (target.type === "shelf") return this.interactShelf(game, target.ref);
  }

  interactShelf(game, shelf) {
    const { state } = game;
    if (this.carry && !this.carry.empty && this.carry.productId === shelf.productId) {
      const product = state.products[shelf.productId];
      if (shelf.stock >= product.shelfCapacity) return game.toast("Estante lleno.", "warn");
      const amount = Math.min(this.carry.units, product.shelfCapacity - shelf.stock);
      shelf.stock += amount;
      state.stockWarnings[shelf.productId] = false;
      this.carry.units -= amount;
      if (this.carry.units <= 0) this.carry = { empty: true };
      return game.toast(`Repuesto +${amount} de ${product.name}.`, "success");
    }
    return game.toast("Necesitas la caja correcta.", "warn");
  }

  checkout(game, register) {
    const customer = game.state.customers.find((person) => person.state === "queue" && person.register === register);
    if (!customer) return game.toast("No hay clientes en cola.", "warn");
    customer.startCheckout(game);
  }

  nearCustomer(game) {
    return game.state.customers.find((customer) => (
      customer.state !== "done" &&
      customer.state !== "leaving" &&
      customer.state !== "angry" &&
      distance(this, customer) < this.config.tile * 1.35
    ));
  }

  moveObject(game) {
    if (this.carry && !this.carry.empty) return this.dropCarriedBox(game);
    const moving = game.state.movingObject;
    if (moving) return this.dropObject(game, moving);
    const target = this.findMovable(game);
    if (!target) return game.toast("No hay objeto movible cerca.", "warn");
    if (target.type === "pallet" && target.ref.boxes.length) return game.toast("Ese pale tiene cajas encima.", "warn");
    game.state.movingObject = target;
    game.toast(`Moviendo ${target.name}. Pulsa Q para soltar.`, "info");
  }

  dropCarriedBox(game) {
    const tile = this.facingTile();
    if (!canStand(tile, game.blocked, game.config)) return game.toast("No puedes dejar la caja ahi.", "warn");
    game.state.droppedBoxes.push({ x: tile.x, y: tile.y, productId: this.carry.productId, units: this.carry.units });
    this.carry = null;
    game.toast("Caja dejada en el suelo.", "info");
  }

  findMovable(game) {
    const { state, config } = game;
    for (const shelf of state.shelves) {
      if (nearbyRect(this, shelf, config.tile)) return { type: "shelf", id: shelf.id, ref: shelf, w: shelf.w, h: shelf.h, name: "estanteria" };
    }
    for (const [index, pallet] of state.pallets.entries()) {
      if (nearbyRect(this, { ...pallet, w: 1, h: 1 }, config.tile)) return { type: "pallet", id: index, ref: pallet, w: 1, h: 1, name: "pale" };
    }
    for (const [index, register] of config.map.registers.entries()) {
      if (nearbyRect(this, register, config.tile)) return { type: "register", id: index, ref: register, w: register.w, h: register.h, name: "caja" };
    }
    if (nearbyRect(this, config.map.office, config.tile)) return { type: "office", id: 0, ref: config.map.office, w: 2, h: 1, name: "ordenador" };
    for (const [index, recycle] of state.recycles.entries()) {
      if (nearbyRect(this, recycle, config.tile)) return { type: "recycle", id: index, ref: recycle, w: 1, h: 1, name: "reciclaje" };
    }
    return null;
  }

  dropObject(game, moving) {
    const target = this.facingTile();
    const rect = { x: target.x, y: target.y, w: moving.w, h: moving.h };
    if (!this.canPlace(rect, game)) return game.toast("No puedes soltarlo ahi.", "warn");
    moving.ref.x = rect.x;
    moving.ref.y = rect.y;
    if (moving.type === "register") {
      moving.ref.queue = [
        { x: rect.x + rect.w, y: rect.y },
        { x: rect.x + rect.w + 1, y: rect.y },
        { x: rect.x + rect.w + 2, y: rect.y }
      ];
    }
    game.state.movingObject = null;
    game.toast(`${moving.name} colocado.`, "success");
  }

  canPlace(rect, game) {
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        if (!canStand({ x, y }, game.blocked, game.config)) return false;
      }
    }
    return true;
  }

  facingTile() {
    const tile = this.tile();
    const offsets = {
      down: { x: 0, y: 1 },
      up: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const offset = offsets[this.dir];
    return { x: tile.x + offset.x, y: tile.y + offset.y };
  }

  boxCapacity() {
    return this.upgrades?.strong ? this.config.player.boxCapacity * 2 : this.config.player.boxCapacity;
  }

  syncUpgrades(upgrades) {
    this.upgrades = upgrades;
  }

  position() {
    return { x: this.x, y: this.y };
  }

  tile() {
    return tileAt(this, this.config.tile);
  }

  warpTo(tile) {
    const point = tileCenter(tile, this.config.tile);
    this.x = point.x;
    this.y = point.y;
  }
}
