export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const rand = (min, max) => min + Math.random() * (max - min);

export const choice = (items) => items[Math.floor(Math.random() * items.length)];

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const tileCenter = (tile, size) => ({
  x: tile.x * size + size / 2,
  y: tile.y * size + size / 2
});

export const money = (value) => `$${value.toFixed(2)}`;

export const rectsTouch = (a, b) => (
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
);

