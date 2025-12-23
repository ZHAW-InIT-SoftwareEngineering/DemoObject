"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointsToNodeIds = pointsToNodeIds;
function pointsToNodeIds(nodes, path) {
    const coordToId = new Map(nodes.map(n => [`${n.x}:${n.y}`, n.id]));
    return path.map(p => {
        const id = coordToId.get(`${p.x}:${p.y}`);
        if (id === undefined)
            throw new Error(`No maze node at (${p.x}, ${p.y})`);
        return id;
    });
}
