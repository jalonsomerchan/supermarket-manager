import { CONFIG } from "./config.js";
import { Game } from "./game.js";

const canvas = document.getElementById("game");
const logicalWidth = CONFIG.world.cols * CONFIG.tile;
const logicalHeight = CONFIG.world.rows * CONFIG.tile;

canvas.dataset.logicalWidth = String(logicalWidth);
canvas.dataset.logicalHeight = String(logicalHeight);
canvas.style.aspectRatio = `${logicalWidth} / ${logicalHeight}`;
canvas.width = logicalWidth;
canvas.height = logicalHeight;

const game = new Game(canvas, CONFIG);
window.game = game;
game.start();
