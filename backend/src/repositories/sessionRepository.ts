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

export async function updateSessionPath(sessionId: string, data: Partial<SessionDataClass>) { return (collection()).updateOne({ sessionId }, { $set: data }) }
