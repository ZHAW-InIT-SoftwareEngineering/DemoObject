import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapiRegistry";

import "../routes/mazePathRoutes";
import "../routes/findPathRoutes";
import "../routes/mazeRoutes";
import "../routes/sessionCreateRoutes";
import "../routes/sessionPathRoutes";

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: { title: "Maze API", version: "0.1.0" },
});
