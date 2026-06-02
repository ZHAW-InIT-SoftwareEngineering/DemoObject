import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapiRegistry";

import "../api/infra/infra.routes";
import "../api/mazes/mazes.routes";
import "../api/sessions/sessions.routes";

export const openApiDocument = new OpenApiGeneratorV3(registry.definitions).generateDocument({
  openapi: "3.0.3",
  info: { title: "Maze API", version: "0.1.0" },
});
