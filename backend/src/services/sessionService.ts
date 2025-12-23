import { randomUUID } from "crypto";
import { createSession, getSession, updateSession } from "../repositories";
import type { SessionDataClass } from "../models/session";

export async function createSessionService(mazeId: string) {
    console.log(`This is the mazeId: ${mazeId}}`)
    const sessionId = randomUUID()
    const doc = await createSession(sessionId, mazeId)
    console.log(`in mongodb created doc:\n ${(JSON.stringify(doc))}`)
    return doc.sessionId
}

export function updateSessionService(id: string, data: Partial<SessionDataClass>) {
    return updateSession(id, data)
}

export async function retrieveSessionService(sessionId: string) {
    const doc = await(getSession(sessionId))
    return doc
}
