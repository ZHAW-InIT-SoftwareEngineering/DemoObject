import { useCallback, useState } from "react";
import { MazesMazeIdShortestPathGet200Response } from "@/api";
import { getShortestPath as getShortestPathService } from "../services/maze";

export function useShortestPath() {
    const [shortestPath, setShortestPath] = useState<MazesMazeIdShortestPathGet200Response | null>(null);

    const getShortestPath = useCallback(async (mazeId: number | null) => {
        if (mazeId === null) return null;
        const shortestPathRes = await getShortestPathService(mazeId);
        setShortestPath(shortestPathRes);
        return shortestPathRes;
    }, []);

    return {
        shortestPath,
        getShortestPath,
    }
}
