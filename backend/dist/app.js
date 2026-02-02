"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const mazes_routes_1 = require("./routes/mazes.routes");
const sessions_routes_1 = require("./routes/sessions.routes");
const openapiDocument_1 = require("./openapi/openapiDocument");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/openapi.json", (_req, res) => res.json(openapiDocument_1.openApiDocument));
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapiDocument_1.openApiDocument));
app.use("/mazes", mazes_routes_1.mazeRouter);
app.use("/sessions", sessions_routes_1.sessionRouter);
exports.default = app;
