"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindPathBFSResponse = exports.FindPathBFSRequest = exports.Maze = exports.MazeWall = exports.MazeEdge = exports.MazeNode = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
// Graph with coordinates in top-left origin (x→right, y→down)
exports.MazeNode = zod_1.z.object({
    id: zod_1.z.number().int().nonnegative(),
    x: zod_1.z.number().int().nonnegative(),
    y: zod_1.z.number().int().nonnegative(),
});
// Undirected/graph edge between node ids
exports.MazeEdge = zod_1.z.object({
    from: zod_1.z.number().int().nonnegative(),
    to: zod_1.z.number().int().nonnegative(),
});
// Wall segment between two node ids (for rendering, not walkable)
exports.MazeWall = zod_1.z.object({
    from: zod_1.z.number().int().nonnegative(),
    to: zod_1.z.number().int().nonnegative(),
});
exports.Maze = zod_1.z.object({
    id: zod_1.z.string().min(1),
    nodes: zod_1.z.array(exports.MazeNode).min(1),
    edges: zod_1.z.array(exports.MazeEdge),
    walls: zod_1.z.array(exports.MazeWall).default([]),
});
exports.FindPathBFSRequest = zod_1.z.object({
    mazeId: zod_1.z.string().min(1),
    startNodeId: zod_1.z.number().int().nonnegative(),
    endNodeId: zod_1.z.number().int().nonnegative(),
});
exports.FindPathBFSResponse = zod_1.z.object({
    // Sequence of node ids representing the shortest path (inclusive of start/end)
    path: zod_1.z.array(zod_1.z.number().int().nonnegative()),
    length: zod_1.z.number().int().nonnegative(),
});
