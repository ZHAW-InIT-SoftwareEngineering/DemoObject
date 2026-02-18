"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazes = exports.Maze = exports.MazeWall = exports.MazeEdge = exports.MazeNode = void 0;
const zod_1 = require("zod");
exports.MazeNode = zod_1.z.object({
    mazeNodeId: zod_1.z.number().int().nonnegative(),
    x: zod_1.z.number().int().nonnegative(),
    y: zod_1.z.number().int().nonnegative(),
});
exports.MazeEdge = zod_1.z.object({
    from: zod_1.z.number().int().nonnegative(),
    to: zod_1.z.number().int().nonnegative(),
});
exports.MazeWall = zod_1.z.object({
    from: zod_1.z.number().int().nonnegative(),
    to: zod_1.z.number().int().nonnegative(),
});
exports.Maze = zod_1.z.object({
    mazeId: zod_1.z.number().int().nonnegative(),
    startNodeId: zod_1.z.number().int().nonnegative(),
    endNodeId: zod_1.z.number().int().nonnegative(),
    nodes: zod_1.z.array(exports.MazeNode).min(1),
    edges: zod_1.z.array(exports.MazeEdge),
    walls: zod_1.z.array(exports.MazeWall).default([]),
});
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
function edge(x1, y1, x2, y2) {
    return [[x1, y1], [x2, y2]];
}
function setVerticalWall(x, y, isBlocked) {
    const key = `${x},${y}`;
    if (isBlocked) {
        verticalWallCoords.add(key);
    }
    else {
        verticalWallCoords.delete(key);
    }
}
function setHorizontalWall(x, y, isBlocked) {
    const key = `${x},${y}`;
    if (isBlocked) {
        horizontalWallCoords.add(key);
    }
    else {
        horizontalWallCoords.delete(key);
    }
}
function applyEdgeAdjustment([[x1, y1], [x2, y2]], isBlocked) {
    if (x1 === x2) {
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        for (let y = minY; y < maxY; y++) {
            setHorizontalWall(x1, y, isBlocked);
        }
        return;
    }
    if (y1 === y2) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        for (let x = minX; x < maxX; x++) {
            setVerticalWall(x, y1, isBlocked);
        }
        return;
    }
    throw new Error(`Unsupported diagonal edge adjustment: (${x1},${y1})-(${x2},${y2})`);
}
function applyEdgeAdjustments(edges, isBlocked) {
    for (const currentEdge of edges) {
        applyEdgeAdjustment(currentEdge, isBlocked);
    }
}
// Base explicit edge adjustments for this maze variant.
const baseBlockedEdges = [
    edge(1, 2, 2, 2), edge(1, 3, 2, 3), edge(0, 1, 1, 1), edge(0, 2, 1, 2),
    edge(0, 6, 1, 6), edge(0, 7, 1, 7), edge(1, 6, 2, 6), edge(1, 7, 2, 7),
    edge(1, 9, 2, 9), edge(0, 9, 1, 9), edge(1, 10, 2, 10), edge(0, 14, 1, 14),
    edge(2, 14, 3, 14), edge(5, 0, 6, 0), edge(5, 2, 6, 2), edge(8, 2, 9, 2),
    edge(9, 2, 10, 2), edge(10, 1, 11, 1), edge(8, 14, 9, 14), edge(14, 1, 15, 1),
    edge(12, 1, 13, 1), edge(12, 2, 13, 2), edge(13, 2, 14, 2), edge(13, 3, 14, 3),
    edge(14, 3, 15, 3), edge(14, 4, 15, 4), edge(14, 6, 15, 6), edge(14, 7, 15, 7),
    edge(8, 1, 8, 2), edge(9, 1, 9, 2), edge(11, 1, 11, 2), edge(13, 0, 13, 1),
    edge(14, 0, 14, 1), edge(12, 13, 12, 14), edge(9, 14, 9, 15), edge(10, 14, 10, 15),
    edge(11, 14, 11, 15), edge(12, 14, 12, 15), edge(8, 3, 8, 4), edge(9, 3, 9, 4),
    edge(1, 3, 1, 4), edge(1, 5, 1, 6), edge(1, 9, 1, 10), edge(1, 13, 1, 14),
    edge(2, 13, 2, 14), edge(2, 0, 3, 0), edge(2, 1, 3, 1), edge(2, 3, 3, 3),
];
const baseOpenEdges = [
    edge(4, 2, 5, 2), edge(2, 5, 2, 6), edge(1, 4, 1, 5), edge(1, 12, 1, 13),
    edge(11, 2, 12, 2), edge(3, 0, 4, 0), edge(3, 2, 4, 2),
];
// Additional explicit edge adjustments requested incrementally.
const additionalBlockedEdges = [
    edge(4, 14, 1, 14), edge(5, 13, 5, 14), edge(6, 14, 7, 14), edge(2, 14, 2, 15),
    edge(1, 1, 2, 1), edge(5, 1, 6, 1), edge(5, 6, 5, 7), edge(6, 6, 6, 7),
    edge(7, 6, 7, 7), edge(4, 7, 4, 8), edge(5, 7, 5, 8), edge(6, 7, 6, 8),
    edge(9, 4, 10, 4), edge(9, 5, 10, 5), edge(9, 6, 10, 6), edge(9, 8, 10, 8),
    edge(4, 10, 4, 11), edge(5, 10, 5, 11), edge(7, 10, 7, 11), edge(9, 9, 9, 10),
    edge(9, 9, 10, 9), edge(9, 10, 10, 10), edge(9, 12, 10, 12), edge(10, 10, 10, 11),
    edge(10, 11, 11, 11), edge(11, 11, 11, 12), edge(11, 11, 12, 11), edge(12, 11, 13, 11),
    edge(14, 10, 14, 11), edge(10, 13, 11, 13), edge(15, 12, 15, 13), edge(15, 14, 15, 15),
    edge(6, 3, 7, 3), edge(7, 3, 8, 3), edge(7, 1, 8, 1), edge(12, 5, 13, 5),
    edge(12, 6, 13, 6), edge(12, 5, 12, 6), edge(13, 5, 13, 6), edge(5, 9, 5, 10),
    edge(2, 9, 2, 10), edge(7, 9, 7, 10), edge(9, 13, 10, 13), edge(11, 12, 12, 12),
];
const additionalOpenEdges = [
    edge(3, 4, 4, 4), edge(5, 8, 5, 9), edge(4, 12, 4, 13), edge(1, 4, 2, 4),
    edge(1, 14, 2, 14), edge(13, 8, 13, 9), edge(7, 5, 8, 5), edge(13, 11, 14, 11),
];
applyEdgeAdjustments(baseBlockedEdges, true);
applyEdgeAdjustments(baseOpenEdges, false);
applyEdgeAdjustments(additionalBlockedEdges, true);
applyEdgeAdjustments(additionalOpenEdges, false);
function hasVerticalWall(x, y) {
    return verticalWallCoords.has(`${x},${y}`);
}
function hasHorizontalWall(x, y) {
    return horizontalWallCoords.has(`${x},${y}`);
}
function buildMaze(mazeId) {
    const nodes = [];
    const edges = [];
    const walls = [];
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const nodeId = y * WIDTH + x;
            nodes.push({ mazeNodeId: nodeId, x, y });
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
    const startNodeId = 0;
    const endNodeId = WIDTH * HEIGHT - 1;
    return { mazeId, startNodeId, endNodeId, nodes, edges, walls };
}
// REMARK: this implies that the maze is build during runtime & then saved in-memory!
exports.mazes = {
    0: buildMaze(0),
};
