import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/openapiRegistry";
import { SessionPathPayload, SessionPathResponse } from "../schemas";
import { getMazeById, pathToDsl, findPathBFS, saveSessionSelection, getSession } from "../services";

export const sessionPathRouter = Router();

const ParamsSchema = z.object({ sessionId: z.string().uuid() });

registry.registerPath({
    method: "post",
    path: "/sessions/{sessionId}/path",
    summary: "Store a user-selected path for a session",
    request: {
        params: ParamsSchema,
        body: { content: { "application/json": { schema: SessionPathPayload } } },
    },
    responses: {
        200: {
            description: "Path stored",
            content: { "application/json": { schema: SessionPathResponse } },
        },
        400: { description: "Invalid request or path" },
        404: { description: "Session or maze not found" },
    },
});

registry.registerPath({
    method: "get",
    path: "/sessions/{sessionId}/path",
    summary: "Retrieve stored path for a session",
    request: { params: ParamsSchema },
    responses: {
        200: {
            description: "Path found",
            content: { "application/json": { schema: SessionPathResponse } },
        },
        404: { description: "Session or path not found" },
    },
});

// Validate that each consecutive hop exists in the maze edges
function isValidPath(mazeId: string, nodePath: number[]): boolean {
    const maze = getMazeById(mazeId);
    if (!maze) return false;
    const nodeSet = new Set(maze.nodes.map(n => n.id));
    const edgeSet = new Set(maze.edges.map(e => `${e.from}-${e.to}`).concat(maze.edges.map(e => `${e.to}-${e.from}`)));
    for (const nodeId of nodePath) {
        if (!nodeSet.has(nodeId)) return false;
    }
    for (let i = 1; i < nodePath.length; i++) {
        const key = `${nodePath[i-1]}-${nodePath[i]}`;
        if (!edgeSet.has(key)) return false;
    }
    return true;
}

sessionPathRouter.post("/:sessionId/path", (req, res) => {
    const params = ParamsSchema.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });
    const parsed = SessionPathPayload.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { sessionId } = params.data;
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const { mazeId, path } = parsed.data;
    if (!isValidPath(mazeId, path)) return res.status(400).json({ error: "Invalid path for maze" });

    // Optionally derive DSL; we need coordinates to use pathToDsl, so project node IDs to coords
    const maze = getMazeById(mazeId)!;
    const coordsPath = path.map(id => {
        const node = maze.nodes.find(n => n.id === id);
        return { x: node?.x ?? 0, y: node?.y ?? 0 };
    });
    const dsl = pathToDsl(coordsPath);

    saveSessionSelection(sessionId, { mazeId, path, dsl });

    return res.json(SessionPathResponse.parse({ mazeId, path, dsl }));
});

sessionPathRouter.get("/:sessionId/path", (req, res) => {
    const params = ParamsSchema.safeParse(req.params);
    if (!params.success) return res.status(400).json({ error: params.error.issues });
    const session = getSession(params.data.sessionId);
    if (!session || !session.selection) return res.status(404).json({ error: "Session path not found" });
    const { mazeId, path, dsl } = session.selection;
    return res.json(SessionPathResponse.parse({ mazeId, path, dsl }));
});
