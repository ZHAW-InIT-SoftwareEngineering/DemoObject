import { Router } from "express";
import { z } from "zod";
import { registry } from "../../openapi/openapiRegistry";
import { isDbHealthy } from "../../db/mongo";

export const infraRouter = Router();

const HealthzOkResponse = z.object({
  status: z.literal("ok"),
});

const HealthzDegradedResponse = z.object({
  status: z.literal("degraded"),
});

registry.registerPath({
  method: "get",
  path: "/healthz",
  summary: "Health check endpoint",
  tags: ["infra"],
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: HealthzOkResponse } },
    },
    503: {
      description: "Service is degraded",
      content: { "application/json": { schema: HealthzDegradedResponse } },
    },
  },
});

infraRouter.get("/healthz", async (_req, res) => {
  const healthy = await isDbHealthy();
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded" });
});
