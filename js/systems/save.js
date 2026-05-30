import { createState } from "../state.js";
import { canStand } from "./world.js";

const KEY = "supermarket-manager-save";
const SETTINGS_KEY = "supermarket-manager-settings";
const SAVE_VERSION = 2;
const DEFAULT_SETTINGS = { zoom: 1 };

export function saveGame(game) {
  const state = structuredClone({ ...game.state, movingObject: null, playerPreview: null, paused: false, pauseOpen: false });
  const payload = {
    version: SAVE_VERSION,
    state,
    player: { x: game.player.x, y: game.player.y, dir: game.player.dir, carry: game.player.carry },
    map: {
      office: game.config.map.office,
      registers: game.config.map.registers
    }
  };
  return JSON.stringify(payload, null, 2);
}

export function saveLocal(game) {
  localStorage.setItem(KEY, saveGame(game));
}

export function hasLocalSave() {
  return Boolean(localStorage.getItem(KEY));
}

export function loadLocal(game) {
  const raw = localStorage.getItem(KEY);
  if (!raw) return false;
  return loadGame(game, raw);
}

export function loadGame(game, raw) {
  const payload = JSON.parse(raw);
  const legacySave = (payload.version || 1) < SAVE_VERSION;
  game.state = { ...createState(game.config), ...payload.state, paused: false, pauseOpen: false };

  if (!legacySave) {
    Object.assign(game.config.map.office, payload.map?.office || {});
    if (payload.map?.registers) {
      game.config.map.registers.splice(0, game.config.map.registers.length, ...payload.map.registers);
    }
  }

  Object.assign(game.player, payload.player || {});
  if (legacySave && !game.state.expansionLevel) migrateToCompactLayout(game);
  return true;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
}

function normalizeSettings(settings) {
  return {
    zoom: Math.min(1.6, Math.max(0.75, Number(settings?.zoom) || DEFAULT_SETTINGS.zoom))
  };
}

function migrateToCompactLayout(game) {
  const fallback = createState(game.config);
  game.state.shelves = fallback.shelves;
  game.state.pallets = fallback.pallets;
  game.state.recycles = fallback.recycles;
  game.state.droppedBoxes = [];
  game.player.warpTo(canStand(game.config.player.start, game.blocked || new Set(), game.config) ? game.config.player.start : { x: 7, y: 12 });
}
