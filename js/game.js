import { Assets } from "./assets.js";
import { Input } from "./input.js";
import { createState } from "./state.js";
import { Player } from "./entities/player.js";
import { Customer } from "./entities/customer.js";
import { Renderer } from "./systems/render.js";
import { UI } from "./ui/hud.js";
import { buildBlocked } from "./systems/world.js";
import { updateOrders } from "./systems/orders.js";
import { addReputation } from "./systems/economy.js";
import { hasLocalSave, loadGame, loadLocal, saveGame, saveLocal } from "./systems/save.js";

export class Game {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.assets = new Assets(config);
    this.input = new Input(config);
    this.state = createState(config);
    this.player = new Player(config);
    this.ui = new UI(this);
    this.spawnTimer = 2;
    this.last = 0;
  }

  async start() {
    await this.assets.load();
    this.renderer = new Renderer(this.canvas, this.config, this.assets);
    this.state.paused = true;
    this.ui.openStartScreen(hasLocalSave());
    requestAnimationFrame((time) => this.loop(time));
  }

  loop(time) {
    const dt = Math.min(0.05, (time - this.last) / 1000 || 0);
    this.last = time;
    this.update(dt);
    this.renderer.render(this);
    this.ui.update();
    requestAnimationFrame((next) => this.loop(next));
  }

  update(dt) {
    this.blocked = buildBlocked(this.config, this.state);
    this.player.syncUpgrades(this.state.upgrades);
    if (this.state.checkoutSummaryOpen && this.input.consumeAction()) {
      this.ui.closeModal();
      return;
    }
    if (this.state.customerInfoOpen && this.input.consumeAction()) {
      this.ui.closeModal();
      return;
    }
    if (this.input.consumePause() && this.state.started) {
      if (!this.ui.isModalHidden()) {
        this.ui.closeModal();
        return;
      }
      this.ui.openPauseMenu();
      return;
    }
    if (this.input.consumeShopToggle() && !this.state.paused) this.toggleShop();
    if (this.input.consumeMove() && !this.state.paused) this.player.moveObject(this);
    if (this.input.consumeAction() && !this.state.paused) this.player.interact(this);
    if (this.state.paused) return;

    this.state.elapsed += dt;
    this.updateClosedReputation(dt);
    if (this.state.elapsed >= this.config.world.realDaySeconds) this.state.phase = "closing";
    updateOrders(this.state, dt);
    this.player.update(dt, this.input, this.blocked);
    this.updateCustomers(dt);
    this.maybeFinishDay();
  }

  updateCustomers(dt) {
    if (this.state.phase === "open") {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.state.customers.length < this.config.world.maxCustomers) {
        this.state.customers.push(new Customer(this.config, this.state, this.blocked));
        this.spawnTimer = this.config.world.customerEverySeconds;
      }
    }
    for (const customer of this.state.customers) customer.update(dt, this);
    this.state.customers = this.state.customers.filter((customer) => customer.state !== "done");
  }

  maybeFinishDay() {
    if (this.state.phase !== "closing" || this.state.customers.length || this.state.reportOpen) return;
    this.ui.openReport();
  }

  nextDay() {
    const carry = this.player.carry;
    this.state.day += 1;
    this.state.elapsed = 0;
    this.state.phase = "closed";
    this.state.paused = false;
    this.state.closedWait = 0;
    this.state.closedPenaltyTimer = 0;
    this.state.reportOpen = false;
    this.state.gross = 0;
    this.state.costs = 0;
    this.state.served = 0;
    this.state.lost = 0;
    this.player.carry = carry?.empty ? null : carry;
    this.ui.closeModal();
    this.toast("Nueva jornada preparada. Abre cuando quieras.", "info");
  }

  newGame() {
    this.state = createState(this.config);
    this.state.started = true;
    this.state.paused = false;
    this.player = new Player(this.config);
    this.ui.closeModal();
    this.toast("Nueva partida iniciada. Pulsa O para abrir.", "success");
  }

  continueGame() {
    if (!loadLocal(this)) return this.toast("No hay partida guardada.", "warn");
    this.state.started = true;
    this.ui.closeModal();
    this.toast("Partida cargada.", "success");
  }

  loadFromJson(text) {
    loadGame(this, text);
    this.state.started = true;
    this.ui.closeModal();
    this.toast("Partida importada.", "success");
  }

  saveToLocal() {
    saveLocal(this);
    this.toast("Partida guardada en localStorage.", "success");
  }

  saveToFile() {
    const blob = new Blob([saveGame(this)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `supermarket-manager-dia-${this.state.day}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast("Archivo de guardado generado.", "success");
  }

  exitToTitle() {
    this.state.paused = true;
    this.state.started = false;
    this.ui.openStartScreen(hasLocalSave());
  }

  toggleShop() {
    if (this.state.phase === "closed") {
      this.state.phase = "open";
      this.toast("Tienda abierta.", "success");
      return;
    }
    if (this.state.phase === "open") {
      this.state.phase = "closing";
      this.toast("Tienda cerrada: no entran mas clientes.", "warn");
      return;
    }
    this.toast("La tienda ya esta en cierre.", "warn");
  }

  updateClosedReputation(dt) {
    if (this.state.phase !== "closed") return;
    this.state.closedWait += dt;
    if (this.state.closedWait < this.config.world.closedGraceSeconds) return;
    this.state.closedPenaltyTimer += dt;
    if (this.state.closedPenaltyTimer < this.config.world.closedReputationPenaltySeconds) return;
    this.state.closedPenaltyTimer = 0;
    addReputation(this.state, -5, this.config);
    this.toast("La reputacion baja por abrir tarde.", "warn");
  }

  toast(text, type = "info") {
    this.ui.toast(text, type);
  }
}
