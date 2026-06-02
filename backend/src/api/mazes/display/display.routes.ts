import { Router } from "express";
import { registry } from "../../../openapi/openapiRegistry";
import { getDisplayFeedService, getDisplayNextService } from "../../../services";
import { MazeIdParams } from "../maze.dto";
import { DisplayFeedResponse, DisplayNextResponse } from "./display.dto";

export const mazeDisplayRouter = Router({ mergeParams: true });

registry.registerPath({
  method: "get",
  path: "/mazes/{mazeId}/display-feed",
  summary: "Retrieve ranked final submissions for a public display leaderboard",
  tags: ["mazes"],
  request: {
    params: MazeIdParams,
  },
  responses: {
    200: {
      description: "Display feed found",
      content: { "application/json": { schema: DisplayFeedResponse } },
    },
    404: { description: "Maze not found" },
  },
});

registry.registerPath({
  method: "get",
  path: "/mazes/{mazeId}/display-next",
  summary: "Retrieve the next final submission path for public display animation",
  tags: ["mazes"],
  request: {
    params: MazeIdParams,
  },
  responses: {
    200: {
      description: "Next display animation found",
      content: { "application/json": { schema: DisplayNextResponse } },
    },
    404: { description: "Maze not found" },
  },
});

mazeDisplayRouter.get("/display-feed", async (req, res) => {
  const params = MazeIdParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: params.error.issues });
  const mazeId = params.data.mazeId;

  const feed = await getDisplayFeedService(mazeId);
  if (!feed) return res.status(404).json({ error: "Maze not found" });

  return res.json(DisplayFeedResponse.parse(feed));
});

mazeDisplayRouter.get("/display-next", async (req, res) => {
  const params = MazeIdParams.safeParse(req.params);
  if (!params.success) return res.status(400).json({ error: params.error.issues });
  const mazeId = params.data.mazeId;

  const next = await getDisplayNextService(mazeId);
  if (!next) return res.status(404).json({ error: "Maze not found" });

  return res.json(DisplayNextResponse.parse(next));
});
