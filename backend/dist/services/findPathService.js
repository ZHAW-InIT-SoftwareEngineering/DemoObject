"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPathBFS = findPathBFS;
const mazeService_1 = require("./mazeService");
// Compute shortest path using BFS on an undirected graph.
function findPathBFS(params) {
    const { mazeId, startNodeId, endNodeId } = params;
    const maze = (0, mazeService_1.getMazeById)(mazeId);
    if (!maze)
        return undefined;
    const { nodes, edges } = maze;
    const nodeSet = new Set(nodes.map(n => n.id));
    if (!nodeSet.has(startNodeId) || !nodeSet.has(endNodeId))
        return undefined;
    // Build adjacency list
    const adj = new Map();
    nodes.forEach(n => adj.set(n.id, []));
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
    // Reconstruct path
    const path = [];
    let cur = endNodeId;
    while (cur !== undefined) {
        path.push(cur);
        const p = parent.get(cur);
        if (p === undefined)
            break;
        cur = p;
    }
    path.reverse();
    return { path, length: path.length - 1 };
}
