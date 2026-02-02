import { getDbCollection } from "../db/mongo";
import { ObjectId } from "mongodb";
import { SessionDataClass } from "../models/session";

function getCollectionName(): string {
    const name = process.env.DEMO_OBJECT_COLLECTION_NAME;
    if (!name) throw new Error("DEMO_OBJECT_COLLECTION_NAME is not set in the environment");
    return name;
}

const collection = () => getDbCollection<SessionDataClass>(getCollectionName());

export async function createSession(sessionId: string, mazeId: number) { 
    const doc: SessionDataClass = SessionDataClass.parse({
      _id: new ObjectId(),
      sessionId: sessionId,
      mazeId: mazeId,
      status: "PENDING",
      createdAt: new Date(),
    });
    await collection().insertOne(doc);
    return doc;
}

export async function getSession(sessionId: string) { return (collection()).findOne({ sessionId }) }

export async function updateSession(sessionId: string, data: Partial<SessionDataClass>) {
    const updatedDocument = await collection().findOneAndUpdate(
        { sessionId },
        { $set: data },
        { returnDocument: "after" }
    );

    return updatedDocument ? SessionDataClass.parse(updatedDocument) : null;
}
