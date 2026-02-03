import { Path, pathToDsl, findPathBFS } from "../domain";
import { getSession, updateSession } from "../repositories";
import { getMazeById } from "./maze.service";

export async function storePathAndDSLForSession(sessionId: string, path: Path) {
    const existing = await getSession(sessionId);
    if (!existing) return null;

    const dsl = pathToDsl(path);
    return updateSession(sessionId, { path, dsl });
};

// TODO: check if this function or more precisely the /:mazeId/paths/dsl is even needed!
export function computeDSLFromPath(path: Path) {
    return pathToDsl(path);
};

// TODO: same here basically only a wrapper function... 
export function computeShortestPath(mazeId: number) {
    const maze = getMazeById(mazeId);
    if (!maze) return undefined;
    return findPathBFS(maze);
}; 
