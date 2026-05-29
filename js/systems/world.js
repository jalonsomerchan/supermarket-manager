import { rectsTouch } from "../utils/math.js";

export function buildBlocked(config, state) {
  const blocked = new Set();
  const add = (rect) => {
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) blocked.add(`${x},${y}`);
    }
  };
  config.map.walls.forEach(add);
  if (!state.expansionLevel) config.map.expansionWalls?.forEach(add);
  const moving = state.movingObject;
  state.shelves.forEach((shelf) => {
    if (!isMoving(moving, "shelf", shelf.id)) add(shelf);
  });
  config.map.registers.forEach((register, index) => {
    if (!isMoving(moving, "register", index)) add(register);
  });
  if (!isMoving(moving, "office", 0)) add(config.map.office);
  state.recycles.forEach((recycle, index) => {
    if (!isMoving(moving, "recycle", index)) add(recycle);
  });
  state.pallets.forEach((pallet, index) => {
    if (!isMoving(moving, "pallet", index)) add({ ...pallet, w: 1, h: 1 });
  });
  return blocked;
}

function isMoving(moving, type, id) {
  return moving?.type === type && moving.id === id;
}

export function tileAt(pos, size) {
  return { x: Math.floor(pos.x / size), y: Math.floor(pos.y / size) };
}

export function canStand(tile, blocked, config) {
  return tile.x >= 0 && tile.y >= 0 && tile.x < config.world.cols && tile.y < config.world.rows && !blocked.has(`${tile.x},${tile.y}`);
}

export function nearbyRect(player, rect, tileSize) {
  const tile = tileAt(player, tileSize);
  return rectsTouch({ x: tile.x - 1, y: tile.y - 1, w: 3, h: 3 }, rect);
}

export function adjacentOpenTile(rect, blocked, config) {
  return adjacentOpenTiles(rect, blocked, config)[0] || { x: rect.x, y: rect.y + rect.h };
}

export function adjacentOpenTiles(rect, blocked, config) {
  const candidates = [
    { x: rect.x - 1, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x, y: rect.y + rect.h },
    { x: rect.x, y: rect.y - 1 }
  ];
  return candidates.filter((tile) => canStand(tile, blocked, config));
}
