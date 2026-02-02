"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazePathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
const zod_1 = require("zod");
exports.mazePathRouter = (0, express_1.Router)();
const MazeId = zod_1.z.object({ mazeId: zod_1.z.coerce.number().int().nonnegative() });
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/maze/{mazeId}/dsl",
    request: {
        params: MazeId,
        body: { content: { "application/json": { schema: schemas_1.CompilePathRequest } } },
    },
    responses: {
        200: {
            description: "Compile a user-provided maze path do DSL",
            content: { "application/json": { schema: schemas_1.CompilePathResponse } }
        },
        400: { description: "Invalid request / invalid path" }
    },
});
exports.mazePathRouter.post("/:mazeId/dsl", (req, res) => {
    const parsed = schemas_1.CompilePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const mazeId = MazeId.safeParse(req.params);
    if (!mazeId.success)
        return res.status(400).json({ error: mazeId.error.issues });
    const { path } = parsed.data;
    // TODO: validate the path: validPath(mazeId, path)
    const dsl = (0, services_1.pathToDsl)(path);
    return res.json(schemas_1.CompilePathResponse.parse({ dsl }));
});
