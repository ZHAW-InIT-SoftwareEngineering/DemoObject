"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathToDsl = pathToDsl;
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
    if (dx === 0 && dy > 0)
        return 'UP';
    if (dx > 0 && dy === 0)
        return 'RIGHT';
    if (dx < 0 && dy === 0)
        return 'LEFT';
    if (dx === 0 && dy < 0)
        return 'DOWN';
    return 'INVALID'; // diagonal move => not allowed!
}
