import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapiRegistry";

import "../api/routes/infra.routes";
import "../api/routes/mazes.routes";
import "../api/routes/sessions.routes";

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: { title: "Maze API", version: "0.1.0" },
});
