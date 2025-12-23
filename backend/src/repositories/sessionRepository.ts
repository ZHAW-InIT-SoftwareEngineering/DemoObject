import { getDbCollection } from "../db/mongo";
import { ObjectId } from "mongodb";
import { SessionDataClass } from "../models/session";

const collection = () => getDbCollection<SessionDataClass>(process.env.DEMO_OBJECT_COLLECTION_NAME)

export async function createSession(sessionId: string, mazeId: string) { 
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
    const result = await collection().findOneAndUpdate(
        { sessionId },
        { $set: data },
        { returnDocument: "after" }
    );

    return result ? SessionDataClass.parse(result) : null;
}
