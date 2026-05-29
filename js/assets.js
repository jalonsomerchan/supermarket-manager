export class Assets {
  constructor(config) {
    this.config = config;
    this.images = {};
  }

  async load() {
    await Promise.all(Object.entries(this.config.sprites).map(([id, src]) => {
      if (typeof src !== "string") return Promise.resolve();
      return this.loadImage(id, src);
    }));
  }

  loadImage(id, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.images[id] = image;
        resolve();
      };
      image.onerror = () => reject(new Error(`No se pudo cargar el sprite "${id}" desde ${src}`));
      image.src = src;
    });
  }
}
