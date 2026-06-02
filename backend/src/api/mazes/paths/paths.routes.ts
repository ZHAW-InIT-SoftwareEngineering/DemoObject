import { Router } from "express";
import { registry } from "../../../openapi/openapiRegistry";
import { computeDSLFromPath, getMazeById } from "../../../services";
import { isValidPath } from "../../../util";
import { MazeIdParams } from "../maze.dto";
import { CompilePathRequest, CompilePathResponse } from "./path.dto";

export const mazePathsRouter = Router({ mergeParams: true });

registry.registerPath({
  method: "post",
  path: "/mazes/{mazeId}/paths/dsl",
  summary: "Compute the DSL of a specific provided path through the maze.",
  tags: ["mazes"],
  request: {
    params: MazeIdParams,
    body: { content: { "application/json": { schema: CompilePathRequest } } },
  },
  responses: {
    200: {
      description: "Compile a user-provided maze path do DSL",
      content: { "application/json": { schema: CompilePathResponse } },
    },
    400: { description: "Invalid request" },
    404: { description: "Maze not found" },
    412: { description: "Invalid path" },
  },
});

mazePathsRouter.post("/dsl", (req, res) => {
  const body = CompilePathRequest.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.issues });
  const { path } = body.data;

  const params = MazeIdParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: params.error.issues });
  const mazeId = params.data.mazeId;

  const maze = getMazeById(mazeId);
  if (!maze) return res.status(404).json({ error: "Maze not found" });

  if (!isValidPath(maze, path)) {
    return res.status(412).json({ error: "invalid path" });
  }

  const dsl = computeDSLFromPath(path);
  return res.json(CompilePathResponse.parse({ dsl }));
});
