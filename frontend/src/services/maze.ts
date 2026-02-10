import { mazeApi } from "../lib/api"

export async function getMazeById(mazeId: number) {
    const mazeRes = await mazeApi.mazesMazeIdGet({ mazeId: mazeId });
    return mazeRes
}

export async function getShortestPath(mazeId: number) {
    const shortestPath = await mazeApi.mazesMazeIdShortestPathGet({ mazeId: mazeId });
    return shortestPath
}
