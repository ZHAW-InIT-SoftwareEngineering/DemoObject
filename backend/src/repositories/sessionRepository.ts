import { Session } from "../domain/session";
import { insertSessionDoc, findSessionDoc, updateSessionDoc  } from "../db/mongo";


export async function createSession(sessionId: string, mazeId: number): Promise<Session> { 
    return await insertSessionDoc(sessionId, mazeId);
};

export async function getSession(sessionId: string): Promise<Session> { 
    return findSessionDoc(sessionId) 
};

export async function updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
    return await updateSessionDoc(sessionId, data);
};
