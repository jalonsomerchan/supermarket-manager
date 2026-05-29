import { buyLicense, buyUpgrade, changePrice, ownedProductIds } from "../systems/economy.js";
import { placeOrder } from "../systems/orders.js";
import { money } from "../utils/math.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.hud = document.getElementById("hud");
    this.modal = document.getElementById("modal");
    this.toastEl = document.getElementById("toast");
    this.worldLabels = document.getElementById("world-labels");
    this.snacks = [];
    this.activeTab = "orders";
    this.htmlCache = new Map();
    this.logicalWidth = Number(game.canvas.dataset.logicalWidth) || game.canvas.width;
    this.logicalHeight = Number(game.canvas.dataset.logicalHeight) || game.canvas.height;
  }

  update() {
    this.renderHud();
    this.renderWorldLabels();
    this.flushMessages();
    this.renderSnacks();
  }

  renderHud() {
    const { state, config } = this.game;
    const hour = config.world.openingHour + state.elapsed / config.world.realDaySeconds * 12;
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60).toString().padStart(2, "0");
    const shopLabel = state.phase === "closed" ? "Cerrado" : state.phase === "open" ? "Abierto" : "Cierre";
    const orders = state.orders.map((order) => `<div class="tag">Camion ${state.products[order.productId].name} ${Math.ceil(order.remaining)}s</div>`).join("");
    this.setHtml("hud", this.hud, `
      <div class="tag"><span>Dia</span> ${state.day} ${h}:${m}</div>
      <div class="tag"><span>Caja</span> ${money(state.money)}</div>
      <div class="tag"><span>Rep</span> ${state.reputation} (${state.reputationXp}/${config.world.reputationPerLevel})</div>
      <div class="tag ${state.phase}"><span>Estado</span> ${shopLabel}</div>
      <div class="tag"><span>Carga</span> ${this.carryLabel()}</div>
      ${orders}
    `);
  }

  carryLabel() {
    const { state } = this.game;
    const carry = this.game.player.carry;
    if (state.movingObject) return `Moviendo ${state.movingObject.name}`;
    if (!carry) return "Manos libres";
    if (carry.empty) return "Caja vacia";
    return `${state.products[carry.productId].name}: ${carry.units} uds.`;
  }

  setHtml(key, element, html) {
    if (this.htmlCache.get(key) === html) return;
    this.htmlCache.set(key, html);
    element.innerHTML = html;
  }

  openTerminal() {
    this.game.state.paused = true;
    this.game.state.terminalOpen = true;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card terminal-card-wrap"><h1>Terminal de Gestion</h1><p class="terminal-hint">Consulta stock, costes y requisitos antes de comprar o ajustar precios.</p><div class="controls"><button class="pixel-btn" data-tab="orders">Pedidos</button><button class="pixel-btn" data-tab="prices">Precios</button><button class="pixel-btn" data-tab="licenses">Licencias</button><button class="pixel-btn" data-tab="upgrades">Mejoras</button><button class="pixel-btn" data-tab="furniture">Mobiliario</button><button class="pixel-btn" data-close="true">Cerrar</button></div><div id="modal-content"></div></article>`;
    this.modal.onclick = (event) => this.handleModalClick(event);
    this.bindModalKeys();
    this.renderTab("orders");
    this.focusFirstButton();
  }

  renderTab(tab) {
    this.activeTab = tab;
    const content = this.modal.querySelector("#modal-content");
    const views = { orders: this.ordersHtml, prices: this.pricesHtml, licenses: this.licensesHtml, upgrades: this.upgradesHtml, furniture: this.furnitureHtml };
    content.innerHTML = views[tab].call(this);
    this.focusFirstContentButton();
  }

  ordersHtml() {
    const { state } = this.game;
    return this.section("Pedidos al proveedor", ownedProductIds(state).map((id) => {
      const p = state.products[id];
      const stock = this.productStock(id);
      const capacity = this.productCapacity(id) || p.shelfCapacity;
      const unitCost = p.boxCost / p.lot;
      return this.card(p.name, `Stock ${stock}/${capacity} · Caja ${p.lot} uds. · Coste ${money(p.boxCost)} · Margen ${money(p.basePrice - unitCost)}`, `<button class="pixel-btn" data-order="${id}" ${state.money < p.boxCost ? "disabled" : ""}>Pedir</button>`);
    }).join(""));
  }

  pricesHtml() {
    const { state, config } = this.game;
    return this.section("Precios de venta", ownedProductIds(state).map((id) => {
      const p = state.products[id];
      const unitCost = p.boxCost / p.lot;
      const isExpensive = p.basePrice / p.basePriceRecommended >= config.customer.overpriceSoftLimit;
      return this.card(p.name, `Actual ${money(p.basePrice)} · Recomendado ${money(p.basePriceRecommended)} · Margen ${money(p.basePrice - unitCost)}${isExpensive ? " · Caro" : ""}`, `<span class="price-actions"><button class="pixel-btn" data-price="${id}" data-delta="-0.1">-0.10</button><button class="pixel-btn" data-price="${id}" data-delta="0.1">+0.10</button></span>`, isExpensive ? "warn" : "");
    }).join(""));
  }

  licensesHtml() {
    const { state } = this.game;
    return this.section("Licencias", Object.entries(state.licenses).map(([id, license]) => {
      const lacksRep = state.reputation < license.level;
      const lacksMoney = state.money < license.cost;
      const disabled = license.owned || lacksRep || lacksMoney;
      const products = license.products.map((productId) => state.products[productId].name).join(", ");
      return this.card(license.name, `Coste ${money(license.cost)} · Rep ${license.level} · ${license.owned ? "Comprada" : products}`, `<button class="pixel-btn" data-license="${id}" ${disabled ? "disabled" : ""}>Comprar</button>`, license.owned ? "owned" : disabled ? "locked" : "");
    }).join(""));
  }

  upgradesHtml() {
    const { state, config } = this.game;
    return this.section("Mejoras", Object.entries(config.upgrades).map(([id, up]) => this.card(up.name, `${state.upgrades[id] ? "Activa" : money(up.cost)} · ${up.desc}`, `<button class="pixel-btn" data-upgrade="${id}" ${state.upgrades[id] || state.money < up.cost ? "disabled" : ""}>Comprar</button>`, state.upgrades[id] ? "owned" : state.money < up.cost ? "locked" : "")).join(""));
  }

  furnitureHtml() {
    const { state, config } = this.game;
    const shelves = ownedProductIds(state).map((productId) => {
      const product = state.products[productId];
      const item = config.furniture.shelf;
      return this.card(`${item.name}: ${product.name}`, `Coste ${money(item.cost)} · Capacidad ${product.shelfCapacity} uds. · Coloca con Q`, `<button class="pixel-btn" data-shelf-product="${productId}" ${state.money < item.cost ? "disabled" : ""}>Comprar</button>`, state.money < item.cost ? "locked" : "");
    }).join("");
    const rest = Object.entries(config.furniture).filter(([id]) => id !== "shelf").map(([id, item]) => this.card(item.name, `Coste ${money(item.cost)} · Coloca con Q`, `<button class="pixel-btn" data-furniture="${id}" ${state.money < item.cost ? "disabled" : ""}>Comprar</button>`, state.money < item.cost ? "locked" : "")).join("");
    return this.section("Comprar mobiliario", shelves + rest);
  }

  section(title, cards) {
    return `<header class="terminal-intro"><h2>${title}</h2></header><div class="grid-list terminal-grid">${cards}</div>`;
  }

  card(title, text, action, className = "") {
    return `<article class="terminal-card ${className}"><div class="terminal-card-main"><h3>${title}</h3><p class="terminal-note">${text}</p></div><div class="terminal-actions">${action}</div></article>`;
  }

  productStock(productId) {
    return this.game.state.shelves.filter((shelf) => shelf.productId === productId).reduce((total, shelf) => total + shelf.stock, 0);
  }

  productCapacity(productId) {
    return this.game.state.shelves.filter((shelf) => shelf.productId === productId).reduce((total, shelf) => total + this.game.state.products[shelf.productId].shelfCapacity, 0);
  }

  handleModalClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.close) return this.closeModal();
    if (target.dataset.tab) return this.renderTab(target.dataset.tab);
    if (target.dataset.order) {
      const message = placeOrder(this.game.state, this.game.config, target.dataset.order);
      const ok = message.startsWith("Pedido de");
      this.game.toast(message, ok ? "success" : "warn");
      if (ok) this.orderFlash();
      return this.renderTab(this.activeTab);
    }
    if (target.dataset.price) {
      changePrice(this.game.state, target.dataset.price, Number(target.dataset.delta));
      return this.renderTab(this.activeTab);
    }
    if (target.dataset.license) {
      this.game.toast(buyLicense(this.game.state, this.game.config, target.dataset.license));
      return this.renderTab(this.activeTab);
    }
    if (target.dataset.upgrade) {
      this.game.toast(buyUpgrade(this.game.state, this.game.config, target.dataset.upgrade));
      return this.renderTab(this.activeTab);
    }
    if (target.dataset.shelfProduct) return this.buyFurniture("shelf", target.dataset.shelfProduct);
    if (target.dataset.furniture) return this.buyFurniture(target.dataset.furniture);
  }

  orderFlash() {
    const flash = document.createElement("div");
    flash.className = "order-flash";
    flash.textContent = "Pedido realizado";
    document.querySelector(".game-card").append(flash);
    setTimeout(() => flash.remove(), 1200);
  }

  buyFurniture(id, shelfProductId = null) {
    const { state, config } = this.game;
    const item = config.furniture[id];
    if (!item) return;
    if (state.money < item.cost) return this.game.toast("No hay dinero suficiente.", "warn");
    if (state.movingObject) return this.game.toast("Primero coloca el objeto que ya mueves.", "warn");
    state.money -= item.cost;
    state.costs += item.cost;
    const tile = this.game.player.facingTile();
    if (id === "shelf") {
      const productId = shelfProductId || ownedProductIds(state)[0];
      const shelf = { id: `shelf-${Date.now()}`, x: tile.x, y: tile.y, w: 1, h: 2, productId, stock: 0 };
      state.shelves.push(shelf);
      state.movingObject = { type: "shelf", id: shelf.id, ref: shelf, w: 1, h: 2, name: "estanteria" };
    }
    if (id === "pallet") {
      const pallet = { x: tile.x, y: tile.y, boxes: [] };
      state.pallets.push(pallet);
      state.movingObject = { type: "pallet", id: state.pallets.length - 1, ref: pallet, w: 1, h: 1, name: "pale" };
    }
    if (id === "recycle") {
      const recycle = { x: tile.x, y: tile.y, w: 1, h: 1 };
      state.recycles.push(recycle);
      state.movingObject = { type: "recycle", id: state.recycles.length - 1, ref: recycle, w: 1, h: 1, name: "reciclaje" };
    }
    this.game.toast(`${item.name} comprado. Colocalo con Q.`, "success");
    this.closeModal();
  }

  closeModal() {
    this.game.input.pausePressed = false;
    this.game.input.actionPressed = false;
    this.game.state.paused = false;
    this.game.state.terminalOpen = false;
    this.game.state.reportOpen = false;
    this.game.state.checkoutSummaryOpen = false;
    this.game.state.customerInfoOpen = false;
    this.game.state.pauseOpen = false;
    this.modal.classList.add("hidden");
    this.unbindModalKeys();
  }

  isModalHidden() {
    return this.modal.classList.contains("hidden");
  }

  openStartScreen(hasSave) {
    this.game.state.paused = true;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card title-card"><h1>Supermarket Manager 2D</h1><p class="gold">Gestiona la tienda, compra mobiliario y abre cuando estes listo.</p><div class="menu-stack"><button class="pixel-btn" data-start-new="true">Nueva partida</button><button class="pixel-btn" data-start-continue="true" ${hasSave ? "" : "disabled"}>Continuar</button><button class="pixel-btn" data-load-json="true">Cargar JSON</button></div><input id="load-file" type="file" accept="application/json" hidden></article>`;
    this.modal.onclick = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.startNew) this.game.newGame();
      if (target.dataset.startContinue) this.game.continueGame();
      if (target.dataset.loadJson) this.modal.querySelector("#load-file").click();
    };
    this.modal.querySelector("#load-file").onchange = async (event) => {
      const file = event.target.files?.[0];
      if (file) this.game.loadFromJson(await file.text());
    };
    this.bindModalKeys();
    this.focusFirstButton();
  }

  openPauseMenu() {
    this.game.state.paused = true;
    this.game.state.pauseOpen = true;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card title-card"><h1>Pausa</h1><div class="quick-help"><p><strong>Movimiento:</strong> WASD o flechas.</p><p><strong>Interactuar:</strong> E, Espacio o Enter.</p><p><strong>Tienda:</strong> O abre/cierra. Q coge, suelta o coloca objetos.</p><p><strong>Gestion:</strong> usa el ordenador para pedidos, precios, licencias, mejoras y mobiliario.</p></div><div class="menu-stack"><button class="pixel-btn" data-pause-continue="true">Continuar</button><button class="pixel-btn" data-save-local="true">Guardar localStorage</button><button class="pixel-btn" data-save-file="true">Guardar archivo JSON</button><button class="pixel-btn" data-exit-title="true">Salir al titulo</button></div></article>`;
    this.modal.onclick = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.pauseContinue) this.closeModal();
      if (target.dataset.saveLocal) this.game.saveToLocal();
      if (target.dataset.saveFile) this.game.saveToFile();
      if (target.dataset.exitTitle) this.game.exitToTitle();
    };
    this.bindModalKeys();
    this.focusFirstButton();
  }

  bindModalKeys() {
    this.unbindModalKeys();
    this.modalKeyHandler = (event) => {
      if (this.modal.classList.contains("hidden")) return;
      const buttons = [...this.modal.querySelectorAll("button:not([disabled])")];
      if (event.key === "Escape") {
        event.preventDefault();
        if (this.game.state.started) this.closeModal();
        return;
      }
      if (["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key) && buttons.length) {
        event.preventDefault();
        this.moveFocus(event.key, buttons);
        return;
      }
      if ((event.key === "e" || event.key === "E") && document.activeElement instanceof HTMLButtonElement) {
        event.preventDefault();
        document.activeElement.click();
      }
    };
    window.addEventListener("keydown", this.modalKeyHandler);
  }

  unbindModalKeys() {
    if (!this.modalKeyHandler) return;
    window.removeEventListener("keydown", this.modalKeyHandler);
    this.modalKeyHandler = null;
  }

  focusFirstButton() {
    requestAnimationFrame(() => this.modal.querySelector("button:not([disabled])")?.focus());
  }

  focusFirstContentButton() {
    requestAnimationFrame(() => this.modal.querySelector("#modal-content button:not([disabled])")?.focus());
  }

  moveFocus(key, buttons) {
    const current = Math.max(0, buttons.indexOf(document.activeElement));
    const delta = key === "ArrowDown" || key === "ArrowRight" ? 1 : -1;
    buttons[(current + delta + buttons.length) % buttons.length].focus();
  }

  openCheckoutSummary(cart, total) {
    const { state } = this.game;
    state.paused = true;
    state.checkoutSummaryOpen = true;
    const counts = cart.reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {});
    const lines = Object.entries(counts).map(([id, qty]) => `<div class="row"><span>${state.products[id].name} x${qty}</span><strong>${money(state.products[id].basePrice * qty)}</strong></div>`).join("");
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card"><h1>Ticket de compra</h1><div class="grid-list">${lines}</div><p>Total cobrado: <strong class="good">${money(total)}</strong></p><p class="gold">Pulsa la tecla de accion para cerrar.</p></article>`;
    this.modal.onclick = null;
    this.bindModalKeys();
    this.toast(`Compra cobrada: ${money(total)}`, "success");
  }

  openCustomerInfo(customer) {
    const { state } = this.game;
    state.paused = true;
    state.customerInfoOpen = true;
    const wanted = customer.list.length ? customer.list.map((id) => state.products[id].name).join(", ") : "Ya tiene todo y va a caja.";
    const bought = customer.cart.length ? customer.cart.map((id) => state.products[id].name).join(", ") : "Nada todavia.";
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card"><h1>Cliente</h1><p>Busca: <strong class="gold">${wanted}</strong></p><p>En cesta: ${bought}</p><p class="gold">Pulsa la tecla de accion para cerrar.</p></article>`;
    this.modal.onclick = null;
    this.bindModalKeys();
  }

  openReport() {
    const { state } = this.game;
    state.paused = true;
    state.reportOpen = true;
    const net = state.gross - state.costs;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `<article class="modal-card"><h1>Informe de Ganancias</h1><p>Ingresos brutos: <span class="good">${money(state.gross)}</span></p><p>Gastos de operacion: <span class="bad">${money(state.costs)}</span></p><p>Clientes satisfechos: ${state.served}</p><p>Clientes perdidos: ${state.lost}</p><p>Balance neto: <strong class="${net >= 0 ? "good" : "bad"}">${money(net)}</strong></p><button class="pixel-btn" data-next-day="true">Abrir siguiente dia</button></article>`;
    this.modal.onclick = (event) => {
      if (event.target?.dataset?.nextDay) this.game.nextDay();
    };
    this.bindModalKeys();
    this.focusFirstButton();
  }

  toast(text, type = "info") {
    this.snacks.push({ id: crypto.randomUUID(), text, type, ttl: 2.6 });
    this.renderSnacks();
  }

  flushMessages() {
    while (this.game.state.messages.length) this.toast(this.game.state.messages.shift().text, this.game.state.messages.shift()?.type);
    for (const snack of this.snacks) snack.ttl -= 1 / 60;
    this.snacks = this.snacks.filter((snack) => snack.ttl > 0).slice(-4);
  }

  renderSnacks() {
    this.setHtml("snacks", this.toastEl, this.snacks.map((snack) => `<div class="snack ${snack.type}">${snack.text}</div>`).join(""));
  }

  renderWorldLabels() {
    const { state, config } = this.game;
    const labels = [];
    for (const shelf of state.shelves) {
      if (state.movingObject?.type === "shelf" && state.movingObject.id === shelf.id) continue;
      const product = state.products[shelf.productId];
      labels.push(this.labelHtml(shelf.x * config.tile + config.tile / 2, shelf.y * config.tile - 3, product.name.split(" ")[0].toUpperCase(), "shelf-label"));
    }
    for (const customer of state.customers) {
      if (!customer.bubble || customer.state === "done") continue;
      labels.push(this.labelHtml(customer.x, customer.y - 58, this.bubbleText(customer), `bubble-label ${["empty", "coin", "hourglass"].includes(customer.bubble) ? "warn" : ""}`));
    }
    this.setHtml("worldLabels", this.worldLabels, labels.join(""));
  }

  bubbleText(customer) {
    if (customer.state === "checkout") return `🔎 Cobrando ${Math.ceil(customer.timer)}s`;
    const map = { cart: "🧺 Compra", empty: "❌ Sin stock", coin: "💔 Precio", hourglass: "⏳ Cola", paid: "✓ Pagado" };
    return map[customer.bubble] || "";
  }

  labelHtml(x, y, text, className) {
    return `<div class="world-label ${className}" style="left:${x / (this.logicalWidth || 1) * 100}%;top:${y / (this.logicalHeight || 1) * 100}%">${text}</div>`;
  }
}
