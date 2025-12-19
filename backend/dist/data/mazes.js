"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazes = void 0;
const WIDTH = 16;
const HEIGHT = 16;
// Walls are defined between adjacent cells. Key format: `${x},${y}`.
// Vertical walls are between (x,y) and (x+1,y).
// Horizontal walls are between (x,y) and (x,y+1).
const verticalWallCoords = new Set();
const horizontalWallCoords = new Set();
// Helper to add vertical wall segments with an optional gap list
function addVerticalWallColumn(x, yStart, yEnd, gaps = []) {
    for (let y = yStart; y <= yEnd; y++) {
        if (gaps.includes(y))
            continue;
        verticalWallCoords.add(`${x},${y}`);
    }
}
// Helper to add horizontal wall segments with an optional gap list
function addHorizontalWallRow(y, xStart, xEnd, gaps = []) {
    for (let x = xStart; x <= xEnd; x++) {
        if (gaps.includes(x))
            continue;
        horizontalWallCoords.add(`${x},${y}`);
    }
}
// Define a few corridors with gaps to keep the maze connected
addVerticalWallColumn(3, 0, 14, [7]); // gap at y=7
addVerticalWallColumn(7, 2, 15, [3, 12]); // gaps at y=3 and y=12
addVerticalWallColumn(11, 0, 10, [5]); // gap at y=5
addVerticalWallColumn(13, 5, 15, [9]); // gap at y=9
addHorizontalWallRow(4, 0, 6, [3]); // gap at x=3
addHorizontalWallRow(8, 4, 15, [10]); // gap at x=10
addHorizontalWallRow(12, 0, 10, [6]); // gap at x=6
function hasVerticalWall(x, y) {
    return verticalWallCoords.has(`${x},${y}`);
}
function hasHorizontalWall(x, y) {
    return horizontalWallCoords.has(`${x},${y}`);
}
function buildMaze(id) {
    const nodes = [];
    const edges = [];
    const walls = [];
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const nodeId = y * WIDTH + x;
            nodes.push({ id: nodeId, x, y });
            // Right neighbor (x+1, y)
            if (x + 1 < WIDTH) {
                const rightId = y * WIDTH + (x + 1);
                if (!hasVerticalWall(x, y)) {
                    edges.push({ from: nodeId, to: rightId });
                }
                else {
                    walls.push({ from: nodeId, to: rightId });
                }
            }
            // Down neighbor (x, y+1)
            if (y + 1 < HEIGHT) {
                const downId = (y + 1) * WIDTH + x;
                if (!hasHorizontalWall(x, y)) {
                    edges.push({ from: nodeId, to: downId });
                }
                else {
                    walls.push({ from: nodeId, to: downId });
                }
            }
        }
    }
    return { id, nodes, edges, walls };
}
// Static maze definitions keyed by mazeId
exports.mazes = {
    "0": buildMaze("0"),
};
