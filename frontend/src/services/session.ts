import { sessionsApi } from "../lib/api";

export async function getSessionId(mazeIdValue: number) {
    const sessionRes = await sessionsApi.sessionsPost({
        sessionsPostRequest: { mazeId: mazeIdValue },
    });
    
    return sessionRes;
} 
