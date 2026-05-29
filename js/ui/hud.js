import { buyLicense, buyUpgrade, changePrice, ownedProductIds } from "../systems/economy.js";
import { placeOrder } from "../systems/orders.js";
import { money } from "../utils/math.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.hud = document.getElementById("hud");
    this.panel = document.getElementById("panel");
    this.modal = document.getElementById("modal");
    this.toastEl = document.getElementById("toast");
    this.worldLabels = document.getElementById("world-labels");
    this.snacks = [];
    this.activeTab = "orders";
    this.htmlCache = new Map();
  }

  update() {
    this.renderHud();
    this.renderPanel();
    this.renderWorldLabels();
    this.flushMessages();
    this.renderSnacks();
  }

  renderHud() {
    const { state, config } = this.game;
    const hour = config.world.openingHour + state.elapsed / config.world.realDaySeconds * 12;
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60).toString().padStart(2, "0");
    const orders = state.orders.map((order) => `Camion ${state.products[order.productId].name} ${Math.ceil(order.remaining)}s`);
    const shopLabel = state.phase === "closed" ? "Cerrado" : state.phase === "open" ? "Abierto" : "Cierre";
    const html = `
      <div class="tag"><span>Dia</span> ${state.day} ${h}:${m}</div>
      <div class="tag"><span>Caja</span> ${money(state.money)}</div>
      <div class="tag"><span>Rep</span> ${state.reputation} (${state.reputationXp}/${config.world.reputationPerLevel})</div>
      <div class="tag ${state.phase}"><span>Estado</span> ${shopLabel}</div>
      ${orders.map((text) => `<div class="tag">${text}</div>`).join("")}
    `;
    this.setHtml("hud", this.hud, html);
  }

  renderPanel() {
    this.setHtml("panel", this.panel, this.panelHtml());
  }

  setHtml(key, element, html) {
    if (this.htmlCache.get(key) === html) return;
    this.htmlCache.set(key, html);
    element.innerHTML = html;
  }

  panelHtml() {
    const { state } = this.game;
    const carry = this.game.player.carry;
    return `
      <h1>Supermarket<br>Manager 2D</h1>
      <section class="panel-section">
        <h2>Controles</h2>
        <p>WASD/Flechas para moverte. E/Espacio para interactuar.</p>
        <p>O abre/cierra tienda. Q coge/suelta objetos.</p>
        <p>PC navegable con flechas, Enter/Espacio/E y Escape.</p>
      </section>
      <section class="panel-section">
        <h2>Carga</h2>
        <p>${carry ? (carry.empty ? "Caja vacia: llevala al reciclaje." : `${state.products[carry.productId].name}: ${carry.units} uds.`) : "Manos libres."}</p>
        <p>${state.movingObject ? `Moviendo: ${state.movingObject.name}` : ""}</p>
      </section>
      <section class="panel-section">
        <h2>Estantes</h2>
        ${state.shelves.map((shelf) => this.stockLine(shelf)).join("")}
      </section>
    `;
  }

  stockLine(shelf) {
    const product = this.game.state.products[shelf.productId];
    const ratio = Math.round(shelf.stock / product.shelfCapacity * 100);
    return `<p>${product.name}: ${shelf.stock}/${product.shelfCapacity}</p><div class="bar"><span style="width:${ratio}%"></span></div>`;
  }

  openTerminal() {
    this.game.state.paused = true;
    this.game.state.terminalOpen = true;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `
      <article class="modal-card">
        <h1>Terminal de Gestion</h1>
        <div class="controls">
          <button class="pixel-btn" data-tab="orders">Pedidos</button>
          <button class="pixel-btn" data-tab="prices">Precios</button>
          <button class="pixel-btn" data-tab="licenses">Licencias</button>
          <button class="pixel-btn" data-tab="upgrades">Mejoras</button>
          <button class="pixel-btn" data-tab="furniture">Mobiliario</button>
          <button class="pixel-btn" data-close="true">Cerrar</button>
        </div>
        <div id="modal-content"></div>
      </article>
    `;
    this.modal.onclick = (event) => this.handleModalClick(event);
    this.bindModalKeys();
    this.renderTab("orders");
    this.focusFirstButton();
  }

  renderTab(tab) {
    this.activeTab = tab;
    const content = this.modal.querySelector("#modal-content");
    if (tab === "orders") content.innerHTML = this.ordersHtml();
    if (tab === "prices") content.innerHTML = this.pricesHtml();
    if (tab === "licenses") content.innerHTML = this.licensesHtml();
    if (tab === "upgrades") content.innerHTML = this.upgradesHtml();
    if (tab === "furniture") content.innerHTML = this.furnitureHtml();
    this.focusFirstContentButton();
  }

  ordersHtml() {
    const { state } = this.game;
    return `<h2>Pedidos al proveedor</h2><div class="grid-list">${
      ownedProductIds(state).map((id) => {
        const p = state.products[id];
        return `<div class="row"><span>${p.name}: caja ${p.lot} uds. Coste ${money(p.boxCost)}</span><button class="pixel-btn" data-order="${id}">Pedir</button></div>`;
      }).join("")
    }</div>`;
  }

  pricesHtml() {
    const { state } = this.game;
    return `<h2>Precios de venta</h2><div class="grid-list">${
      ownedProductIds(state).map((id) => {
        const p = state.products[id];
        return `<div class="row"><span>${p.name}: ${money(p.basePrice)} <small>recomendado ${money(p.basePriceRecommended)}</small></span><span><button class="pixel-btn" data-price="${id}" data-delta="-0.1">-</button> <button class="pixel-btn" data-price="${id}" data-delta="0.1">+</button></span></div>`;
      }).join("")
    }</div>`;
  }

  licensesHtml() {
    const { state } = this.game;
    return `<h2>Licencias</h2><div class="grid-list">${
      Object.entries(state.licenses).map(([id, license]) => `<div class="row"><span>${license.name}: ${license.owned ? "Comprada" : `${money(license.cost)} / Rep ${license.level}`}</span><button class="pixel-btn" data-license="${id}" ${license.owned ? "disabled" : ""}>Comprar</button></div>`).join("")
    }</div>`;
  }

  upgradesHtml() {
    const { state, config } = this.game;
    return `<h2>Mejoras</h2><div class="grid-list">${
      Object.entries(config.upgrades).map(([id, up]) => `<div class="row"><span>${up.name}: ${state.upgrades[id] ? "Activa" : `${money(up.cost)} - ${up.desc}`}</span><button class="pixel-btn" data-upgrade="${id}" ${state.upgrades[id] ? "disabled" : ""}>Comprar</button></div>`).join("")
    }</div>`;
  }

  furnitureHtml() {
    const { config, state } = this.game;
    const products = ownedProductIds(state).map((productId) => {
      const product = state.products[productId];
      return `<button class="pixel-btn product-buy" data-shelf-product="${productId}">Estanteria: ${product.name} · ${money(config.furniture.shelf.cost)}</button>`;
    }).join("");
    return `<h2>Comprar mobiliario</h2><p>Al comprarlo entras en modo mover: colocarlo con Q.</p><div class="grid-list">${
      products}
      ${Object.entries(config.furniture)
        .filter(([id]) => id !== "shelf")
        .map(([id, item]) => `<div class="row"><span>${item.name}: ${money(item.cost)}</span><button class="pixel-btn" data-furniture="${id}">Comprar</button></div>`)
        .join("")
    }</div>`;
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
    this.renderTab(this.activeTab);
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
    this.modal.innerHTML = `
      <article class="modal-card title-card">
        <h1>Supermarket Manager 2D</h1>
        <p class="gold">Gestiona la tienda, compra mobiliario y abre cuando estes listo.</p>
        <div class="menu-stack">
          <button class="pixel-btn" data-start-new="true">Nueva partida</button>
          <button class="pixel-btn" data-start-continue="true" ${hasSave ? "" : "disabled"}>Continuar</button>
          <button class="pixel-btn" data-load-json="true">Cargar JSON</button>
        </div>
        <input id="load-file" type="file" accept="application/json" hidden>
      </article>
    `;
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
    this.modal.innerHTML = `
      <article class="modal-card title-card">
        <h1>Pausa</h1>
        <div class="menu-stack">
          <button class="pixel-btn" data-pause-continue="true">Continuar</button>
          <button class="pixel-btn" data-save-local="true">Guardar localStorage</button>
          <button class="pixel-btn" data-save-file="true">Guardar archivo JSON</button>
          <button class="pixel-btn" data-exit-title="true">Salir al titulo</button>
        </div>
      </article>
    `;
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
        if (!this.game.state.started) return;
        this.closeModal();
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
    const tabs = [...this.modal.querySelectorAll(".controls button:not([disabled])")];
    const content = [...this.modal.querySelectorAll("#modal-content button:not([disabled])")];
    const active = document.activeElement;
    if (key === "ArrowDown" && tabs.includes(active) && content.length) return content[0].focus();
    if (key === "ArrowUp" && content.includes(active) && tabs.length) return tabs[Math.min(tabs.length - 1, Math.max(0, content.indexOf(active)))].focus();
    const group = content.includes(active) ? content : tabs.includes(active) ? tabs : buttons;
    const current = Math.max(0, group.indexOf(active));
    const delta = key === "ArrowDown" || key === "ArrowRight" ? 1 : -1;
    group[(current + delta + group.length) % group.length].focus();
  }

  openCheckoutSummary(cart, total) {
    const { state } = this.game;
    state.paused = true;
    state.checkoutSummaryOpen = true;
    const counts = cart.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});
    const lines = Object.entries(counts).map(([id, qty]) => {
      const product = state.products[id];
      return `<div class="row"><span>${product.name} x${qty}</span><strong>${money(product.basePrice * qty)}</strong></div>`;
    }).join("");
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `
      <article class="modal-card">
        <h1>Ticket de compra</h1>
        <div class="grid-list">${lines}</div>
        <p>Total cobrado: <strong class="good">${money(total)}</strong></p>
        <p class="gold">Pulsa la tecla de accion para cerrar.</p>
      </article>
    `;
    this.modal.onclick = null;
    this.bindModalKeys();
    this.toast(`Compra cobrada: ${money(total)}`, "success");
  }

  openCustomerInfo(customer) {
    const { state } = this.game;
    state.paused = true;
    state.customerInfoOpen = true;
    const wanted = customer.list.length
      ? customer.list.map((id) => state.products[id].name).join(", ")
      : "Ya tiene todo y va a caja.";
    const bought = customer.cart.length
      ? customer.cart.map((id) => state.products[id].name).join(", ")
      : "Nada todavia.";
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `
      <article class="modal-card">
        <h1>Cliente</h1>
        <p>Busca: <strong class="gold">${wanted}</strong></p>
        <p>En cesta: ${bought}</p>
        <p class="gold">Pulsa la tecla de accion para cerrar.</p>
      </article>
    `;
    this.modal.onclick = null;
    this.bindModalKeys();
  }

  openReport() {
    const { state } = this.game;
    state.paused = true;
    state.reportOpen = true;
    const net = state.gross - state.costs;
    this.modal.classList.remove("hidden");
    this.modal.innerHTML = `
      <article class="modal-card">
        <h1>Informe de Ganancias</h1>
        <p>Ingresos brutos: <span class="good">${money(state.gross)}</span></p>
        <p>Gastos de operacion: <span class="bad">${money(state.costs)}</span></p>
        <p>Clientes satisfechos: ${state.served}</p>
        <p>Clientes perdidos: ${state.lost}</p>
        <p>Balance neto: <strong class="${net >= 0 ? "good" : "bad"}">${money(net)}</strong></p>
        <button class="pixel-btn" data-next-day="true">Abrir siguiente dia</button>
      </article>
    `;
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
    while (this.game.state.messages.length) {
      const message = this.game.state.messages.shift();
      this.toast(message.text, message.type);
    }
    for (const snack of this.snacks) snack.ttl -= 1 / 60;
    this.snacks = this.snacks.filter((snack) => snack.ttl > 0).slice(-4);
  }

  renderSnacks() {
    const html = this.snacks
      .map((snack) => `<div class="snack ${snack.type}">${snack.text}</div>`)
      .join("");
    this.setHtml("snacks", this.toastEl, html);
  }

  renderWorldLabels() {
    const { state, config } = this.game;
    const labels = [];
    for (const shelf of state.shelves) {
      if (state.movingObject?.type === "shelf" && state.movingObject.id === shelf.id) continue;
      const product = state.products[shelf.productId];
      labels.push(this.labelHtml(
        shelf.x * config.tile + config.tile / 2,
        shelf.y * config.tile - 3,
        product.name.split(" ")[0].toUpperCase(),
        "shelf-label"
      ));
    }
    for (const customer of state.customers) {
      if (!customer.bubble || customer.state === "done") continue;
      labels.push(this.labelHtml(
        customer.x,
        customer.y - 58,
        this.bubbleText(customer),
        `bubble-label ${["empty", "coin", "hourglass"].includes(customer.bubble) ? "warn" : ""}`
      ));
    }
    this.setHtml("worldLabels", this.worldLabels, labels.join(""));
  }

  bubbleText(customer) {
    if (customer.state === "checkout") return `🔎 Cobrando ${Math.ceil(customer.timer)}s`;
    const map = { cart: "🧺 Compra", empty: "❌ Sin stock", coin: "💔 Precio", hourglass: "⏳ Cola", paid: "✓ Pagado" };
    return map[customer.bubble] || "";
  }

  labelHtml(x, y, text, className) {
    const left = x / (this.game.canvas.width || 1) * 100;
    const top = y / (this.game.canvas.height || 1) * 100;
    return `<div class="world-label ${className}" style="left:${left}%;top:${top}%">${text}</div>`;
  }
}
