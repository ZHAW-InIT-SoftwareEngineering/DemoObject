"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storePathAndDSLForSession = storePathAndDSLForSession;
exports.computeDSLFromPath = computeDSLFromPath;
exports.computeShortestPath = computeShortestPath;
const domain_1 = require("../domain");
const repositories_1 = require("../repositories");
const maze_service_1 = require("./maze.service");
async function storePathAndDSLForSession(sessionId, path) {
    const existing = await (0, repositories_1.getSession)(sessionId);
    if (!existing)
        return null;
    const dsl = (0, domain_1.pathToDsl)(path);
    return (0, repositories_1.updateSession)(sessionId, { path, dsl });
}
;
// TODO: check if this function or more precisely the /:mazeId/paths/dsl is even needed!
function computeDSLFromPath(path) {
    return (0, domain_1.pathToDsl)(path);
}
;
// TODO: same here basically only a wrapper function... 
function computeShortestPath(mazeId) {
    const maze = (0, maze_service_1.getMazeById)(mazeId);
    if (!maze)
        return undefined;
    return (0, domain_1.findPathBFS)(maze);
}
;
