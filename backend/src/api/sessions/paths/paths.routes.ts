import { Router } from "express";
import { registry } from "../../../openapi/openapiRegistry";
import {
  retrieveSessionPathService,
  submitSessionPathService,
} from "../../../services";
import { SessionId } from "../session.dto";
import {
  RetrievePathResponse,
  StorePathRequest,
  StorePathResponse,
} from "./sessionPath.dto";

export const sessionPathsRouter = Router({ mergeParams: true });

registry.registerPath({
  method: "put",
  path: "/sessions/{sessionId}/paths",
  summary:
    "Store a user-selected path and its automatically transpiled DSL representation bund to a session ",
  tags: ["sessions"],
  request: {
    params: SessionId,
    body: { content: { "application/json": { schema: StorePathRequest } } },
  },
  responses: {
    200: {
      description: "Path stored",
      content: { "application/json": { schema: StorePathResponse } },
    },
    400: { description: "Invalid request or path" },
    404: { description: "Session not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/sessions/{sessionId}/paths",
  summary: "Retrieve stored path for a session",
  tags: ["sessions"],
  request: { params: SessionId },
  responses: {
    200: {
      description: "Path found",
      content: { "application/json": { schema: RetrievePathResponse } },
    },
    404: { description: "Session not found" },
  },
});

sessionPathsRouter.put("/", async (req, res) => {
  const params = SessionId.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: params.error.issues });

  const body = StorePathRequest.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.issues });

  const { sessionId } = params.data;
  const { path, elapsedMs } = body.data;
  const result = await submitSessionPathService(sessionId, path, elapsedMs);

  if (result.status === "session-not-found") {
    return res.status(404).json({ error: "Session not found" });
  }
  if (result.status === "maze-not-found") {
    return res.status(404).json({ error: "Maze not found" });
  }
  if (result.status === "already-submitted") {
    return res.status(409).json({ error: "Final path already submitted" });
  }
  if (result.status === "invalid-path") {
    return res.status(412).json({
      error: "Path must start at the maze start and end at the goal",
    });
  }

  const { session } = result;
  return res.json(
    StorePathResponse.parse({
      mazeId: session.mazeId,
      path: session.path,
      dsl: session.dsl,
      elapsedMs: session.elapsedMs,
      submittedAt: session.submittedAt,
    }),
  );
});

sessionPathsRouter.get("/", async (req, res) => {
  const parsed = SessionId.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

  const result = await retrieveSessionPathService(parsed.data.sessionId);
  if (result.status === "not-found") {
    return res.status(404).json({ error: "Session path not found" });
  }

  const { session } = result;
  return res.json(
    RetrievePathResponse.parse({
      mazeId: session.mazeId,
      path: session.path,
      dsl: session.dsl,
      elapsedMs: session.elapsedMs,
    }),
  );
});
