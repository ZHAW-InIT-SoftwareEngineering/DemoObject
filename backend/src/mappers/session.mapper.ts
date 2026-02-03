import { Session } from "../domain/session";
import { SessionDb } from "../persistence/mongo/mongo.db";

export function toDomain(doc: SessionDb): Session {
    const { _id, ...rest } = doc;
    return Session.parse(rest);
  }

export function toDb(session: Session): Session {
    return session;
};