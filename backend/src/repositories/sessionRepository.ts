import { Session } from "../domain/session";
import { collection } from "../persistence/mongo/mongo.db";


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
