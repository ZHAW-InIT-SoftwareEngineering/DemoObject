import { Session } from "../domain/session";
import {
    insertSessionDoc,
    findFinalSessionDocsByMazeId,
    findSessionDoc,
    findSessionDocByUserName,
    updateSessionDoc,
} from "../db/mongo";


export async function createSession(sessionId: string, mazeId: number, userName: string): Promise<Session> { 
    return await insertSessionDoc(sessionId, mazeId, userName);
};

export async function getSession(sessionId: string): Promise<Session | null> { 
    return findSessionDoc(sessionId) 
};

export async function getSessionByUserName(userName: string): Promise<Session | null> {
    return findSessionDocByUserName(userName);
}

export async function getFinalSessionsByMazeId(mazeId: number): Promise<Session[]> {
    return findFinalSessionDocsByMazeId(mazeId);
}

export async function updateSession(
    sessionId: string, 
    data: Partial<Session>
): Promise<Session | null> {
    return await updateSessionDoc(sessionId, data);
};
