import { randomUUID } from "crypto";
import { createSession, getSession, updateSession } from "../repositories";
import type { Session } from "../domain/session";


export async function createSessionService(mazeId: number) {
    console.log(`This is the mazeId: ${mazeId}}`)
    const sessionId = randomUUID()
    const doc = await createSession(sessionId, mazeId)
    console.log(`in mongodb created doc:\n ${(JSON.stringify(doc))}`)
    return doc.sessionId
};

export function updateSessionService(sessionId: string, data: Partial<Session>) {
    return updateSession(sessionId, data)
};

export async function retrieveSessionService(sessionId: string) {
    const doc = await(getSession(sessionId))
    return doc
};
