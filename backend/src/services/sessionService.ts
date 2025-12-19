import { randomUUID } from "crypto";

export type SessionPath = {
    mazeId: string;
    path: number[]; // node ids
    dsl: string[];
};

export type Session = {
    id: string;
    createdAt: Date;
    mazeId?: string;
    selection?: SessionPath;
};

const sessions = new Map<string, Session>();

export function createSession(): Session {
    const id = randomUUID();
    const session: Session = { id, createdAt: new Date() };
    sessions.set(id, session);
    return session;
}

export function getSession(id: string): Session | undefined {
    return sessions.get(id);
}

export function saveSessionSelection(id: string, selection: SessionPath): Session | undefined {
    const session = sessions.get(id);
    if (!session) return undefined;
    session.mazeId = selection.mazeId;
    session.selection = selection;
    sessions.set(id, session);
    return session;
}
