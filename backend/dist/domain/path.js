"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = exports.Point = void 0;
exports.pathToDsl = pathToDsl;
exports.findPathBFS = findPathBFS;
const zod_1 = require("zod");
exports.Point = zod_1.z.object({
    x: zod_1.z.number().int(),
    y: zod_1.z.number().int()
});
exports.Path = zod_1.z.array(exports.Point).min(2);
function pathToDsl(path) {
    const dslBlocks = [];
    for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];
        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;
        dslBlocks.push(decideDirection(dx, dy));
    }
    return dslBlocks;
}
function decideDirection(dx, dy) {
    // Screen/maze coordinates use top-left origin: y increases downward.
    // So positive dy means moving down, negative dy means moving up.
    if (dx === 0 && dy > 0)
        return 'DOWN';
    if (dx > 0 && dy === 0)
        return 'RIGHT';
    if (dx < 0 && dy === 0)
        return 'LEFT';
    if (dx === 0 && dy < 0)
        return 'UP';
    return 'INVALID'; // diagonal move => not allowed!
}
// Compute shortest path using BFS on an undirected graph.
function findPathBFS(maze) {
    const { nodes, edges, startNodeId, endNodeId } = maze;
    const nodeSet = new Set(nodes.map((n) => n.mazeNodeId));
    if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId))
        return undefined;
    // Build adjacency list
    const adj = new Map();
    nodes.forEach((n) => adj.set(n.mazeNodeId, []));
    edges.forEach(({ from, to }) => {
        if (adj.has(from) && adj.has(to)) {
            adj.get(from).push(to);
            adj.get(to).push(from);
        }
    });
    const queue = [];
    const visited = new Set();
    const parent = new Map();
    queue.push(startNodeId);
    visited.add(startNodeId);
    while (queue.length) {
        const current = queue.shift();
        if (current === endNodeId)
            break;
        const neighbors = adj.get(current) ?? [];
        for (const next of neighbors) {
            if (!visited.has(next)) {
                visited.add(next);
                parent.set(next, current);
                queue.push(next);
            }
        }
    }
    if (!visited.has(endNodeId))
        return undefined;
    // Reconstruct path (node ids -> coordinates)
    const nodePath = [];
    let cur = endNodeId;
    while (cur !== undefined) {
        nodePath.push(cur);
        const p = parent.get(cur);
        if (p === undefined)
            break;
        cur = p;
    }
    nodePath.reverse();
    const path = nodePath.map((id) => {
        const node = nodes.find((n) => n.mazeNodeId === id);
        return { x: node.x, y: node.y };
    });
    return { path, length: path.length - 1 };
}
;
