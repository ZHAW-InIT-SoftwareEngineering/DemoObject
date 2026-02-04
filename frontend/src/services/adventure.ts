import { sessionsApi, mazeApi } from "../lib/api";

export async function startAdventure(mazeIdValue: number) {
    const sessionRes = await sessionsApi.sessionsPost({
        sessionsPostRequest: { mazeId: mazeIdValue },
    });

    const mazeRes = await mazeApi.mazesMazeIdGet({ mazeId: mazeIdValue });
    
    return { sessionRes, mazeRes };
} 
