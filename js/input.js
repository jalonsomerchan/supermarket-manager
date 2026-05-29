export class Input {
  constructor(config) {
    this.config = config;
    this.keys = new Set();
    this.actionPressed = false;
    this.actionHeld = false;
    this.movePressed = false;
    this.moveHeld = false;
    this.shopPressed = false;
    this.shopHeld = false;
    this.pausePressed = false;
    this.pauseHeld = false;
    this.bindKeyboard();
    this.bindTouch();
  }

  consumeAction() {
    const pressed = this.actionPressed;
    this.actionPressed = false;
    return pressed;
  }

  consumeMove() {
    const pressed = this.movePressed;
    this.movePressed = false;
    return pressed;
  }

  consumeShopToggle() {
    const pressed = this.shopPressed;
    this.shopPressed = false;
    return pressed;
  }

  consumePause() {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  vector() {
    const c = this.config.controls;
    const x = this.any(c.right) - this.any(c.left);
    const y = this.any(c.down) - this.any(c.up);
    return { x, y };
  }

  any(keys) {
    return keys.some((key) => this.keys.has(key));
  }

  bindKeyboard() {
    window.addEventListener("keydown", (event) => {
      if (this.isAction(event.key) && !this.actionHeld) this.actionPressed = true;
      if (this.isAction(event.key)) this.actionHeld = true;
      if (this.isMove(event.key) && !this.moveHeld) this.movePressed = true;
      if (this.isMove(event.key)) this.moveHeld = true;
      if (this.isShop(event.key) && !this.shopHeld) this.shopPressed = true;
      if (this.isShop(event.key)) this.shopHeld = true;
      if (this.isPause(event.key) && !this.pauseHeld) this.pausePressed = true;
      if (this.isPause(event.key)) this.pauseHeld = true;
      this.keys.add(event.key);
    });
    window.addEventListener("keyup", (event) => {
      if (this.isAction(event.key)) this.actionHeld = false;
      if (this.isMove(event.key)) this.moveHeld = false;
      if (this.isShop(event.key)) this.shopHeld = false;
      if (this.isPause(event.key)) this.pauseHeld = false;
      this.keys.delete(event.key);
    });
  }

  bindTouch() {
    const root = document.getElementById("touch");
    root.innerHTML = `
      <div class="pad">
        <button class="up" data-key="ArrowUp">▲</button>
        <button class="left" data-key="ArrowLeft">◀</button>
        <button class="right" data-key="ArrowRight">▶</button>
        <button class="down" data-key="ArrowDown">▼</button>
      </div>
      <button class="act" data-action="true">E</button>
    `;
    for (const button of root.querySelectorAll("button")) {
      const press = (event) => {
        event.preventDefault();
        if (button.dataset.action) {
          this.actionPressed = true;
          this.actionHeld = true;
        } else {
          this.keys.add(button.dataset.key);
        }
      };
      const release = () => {
        if (button.dataset.action) this.actionHeld = false;
        else this.keys.delete(button.dataset.key);
      };
      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    }
  }

  isAction(key) {
    return this.config.controls.actionKeys.includes(key);
  }

  isMove(key) {
    return this.config.controls.moveKeys.includes(key);
  }

  isShop(key) {
    return this.config.controls.shopKeys.includes(key);
  }

  isPause(key) {
    return this.config.controls.pauseKeys.includes(key);
  }
}
