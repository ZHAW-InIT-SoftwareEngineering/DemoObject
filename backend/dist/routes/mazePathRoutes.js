"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mazePathRouter = void 0;
const express_1 = require("express");
const openapiRegistry_1 = require("../openapi/openapiRegistry");
const schemas_1 = require("../schemas");
const services_1 = require("../services");
exports.mazePathRouter = (0, express_1.Router)();
openapiRegistry_1.registry.registerPath({
    method: "post",
    path: "/mazePaths/toDSL",
    request: {
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
exports.mazePathRouter.post("/toDSL", (req, res) => {
    const parsed = schemas_1.CompilePathRequest.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const { mazeId, path } = parsed.data;
    console.log("mazeId: " + mazeId);
    // TODO
    /*
    1. loadMaze(mazeId)
    2, validPath(mazeId, path)
    3. dsl = pathToDsl(path) - DONE
    */
    const dsl = (0, services_1.pathToDsl)(path);
    return res.json(schemas_1.CompilePathResponse.parse({ dsl }));
});
