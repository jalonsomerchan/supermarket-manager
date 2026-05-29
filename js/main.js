import { CONFIG } from "./config.js";
import { Game } from "./game.js";

const canvas = document.getElementById("game");
canvas.width = CONFIG.world.cols * CONFIG.tile;
canvas.height = CONFIG.world.rows * CONFIG.tile;

const game = new Game(canvas, CONFIG);
window.game = game;
game.start();
