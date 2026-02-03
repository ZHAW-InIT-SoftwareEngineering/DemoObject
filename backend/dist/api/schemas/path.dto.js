"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePathResponse = exports.RetrievePathResponse = exports.RetrievePathRequest = exports.StorePathResponse = exports.StorePathRequest = exports.UpdatePathRequest = exports.CompilePathResponse = exports.CompilePathRequest = exports.ShortestPathResponse = void 0;
const index_1 = require("../../domain/index");
const zod_1 = require("zod");
exports.ShortestPathResponse = zod_1.z.object({
    path: index_1.Path,
    length: zod_1.z.number().int().nonnegative(),
});
exports.CompilePathRequest = zod_1.z.object({
    path: index_1.Path
});
exports.CompilePathResponse = zod_1.z.object({
    dsl: index_1.DSL
});
exports.UpdatePathRequest = zod_1.z.object({
    path: index_1.Path,
});
exports.StorePathRequest = zod_1.z.object({
    path: index_1.Path,
});
exports.StorePathResponse = zod_1.z.object({
    mazeId: index_1.Maze.shape.mazeId,
    path: index_1.Path,
    dsl: index_1.DSL
});
exports.RetrievePathRequest = zod_1.z.object({
    sessionId: index_1.Session.shape.sessionId,
});
exports.RetrievePathResponse = zod_1.z.object({
    mazeId: index_1.Maze.shape.mazeId,
    path: index_1.Path,
    dsl: index_1.DSL
});
exports.UpdatePathResponse = index_1.Session;
