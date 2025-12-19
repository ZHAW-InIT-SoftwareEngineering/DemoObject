"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMazeById = getMazeById;
const mazes_1 = require("../data/mazes");
function getMazeById(mazeId) {
    return mazes_1.mazes[mazeId];
}
