"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiDocument = void 0;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const openapiRegistry_1 = require("./openapiRegistry");
require("../routes/mazePathRoutes");
require("../routes/findPathRoutes");
require("../routes/mazeRoutes");
require("../routes/sessionCreateRoutes");
require("../routes/sessionPathRoutes");
exports.openApiDocument = new zod_to_openapi_1.OpenApiGeneratorV3(openapiRegistry_1.registry.definitions).generateDocument({
    openapi: "3.0.3",
    info: { title: "Maze API", version: "0.1.0" },
});
