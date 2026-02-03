"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMazeById = getMazeById;
const maze_1 = require("../domain/maze");
function getMazeById(mazeId) {
    if (!maze_1.mazes[mazeId]) {
        console.error("Maze not found!");
        return null;
    }
    else {
        return maze_1.mazes[mazeId];
    }
}
;
