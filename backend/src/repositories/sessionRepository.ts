import { getDbCollection } from "../db/mongo";
import { Session } from "../domain/session";

function getCollectionName(): string {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name) throw new Error("DEMO_OBJECT_COLLECTION_NAME is not set in the environment");
    return name;
};

const collection = () => getDbCollection<Session>(getCollectionName());

export async function createSession(sessionId: string, mazeId: number) { 
    const doc: Session = Session.parse({
      sessionId: sessionId,
      mazeId: mazeId,
      createdAt: new Date(),
    });
    await collection().insertOne(doc);
    return doc;
};

export async function getSession(sessionId: string) { return (collection()).findOne({ sessionId }) };

export async function updateSession(sessionId: string, data: Partial<Session>) {
    const updatedDocument = await collection().findOneAndUpdate(
        { sessionId },
        { $set: data },
        { returnDocument: "after" }
    );

    return updatedDocument ? Session.parse(updatedDocument) : null;
};
