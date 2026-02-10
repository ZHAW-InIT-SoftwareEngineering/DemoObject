import { useCallback, useState } from "react";
import { mazeApi } from "../lib/api";
import { MazesMazeIdShortestPathGet200Response } from "@/api";

export function useShortestPath() {
    const [shortestPath, setShortestPath] = useState<MazesMazeIdShortestPathGet200Response | null>(null);

    const getShortestPath = useCallback(async (mazeId: number | null) => {
        if (mazeId === null) return null;
        const shortestPathRes = await mazeApi.mazesMazeIdShortestPathGet({ mazeId });
        setShortestPath(shortestPathRes);
        return shortestPathRes;
    }, []);

    return {
        shortestPath,
        getShortestPath
    }
}
