import { randomUUID } from "crypto";
import { createSession, getSession, updateSessionPath } from "../repositories"; 
import { SessionDataClass } from "../models/session";

export async function createSessionService(mazeId: string) {
    console.log(`This is the mazeId: ${mazeId}}`)
    const sessionId = randomUUID()
    const doc = await createSession(sessionId, mazeId)
    console.log(`in mongodb created doc:\n ${(JSON.stringify(doc))}`)
    return doc.sessionId
}

export function updateSessionPathService(id: string, data: Partial<SessionDataClass>) {
    return updateSessionPath(id, data)
}

export async function retrieveSessionService(sessionId: string) {
    const doc = await(getSession(sessionId))
    return doc
}
