import { ObjectId } from "mongodb";
import { Session } from "../../domain/session";
import { z } from "zod";
import { getDbCollection } from "../../db/mongo";



export const SessionDb = Session.extend({
_id: z.instanceof(ObjectId),
});

export type SessionDb = z.infer<typeof SessionDb>;


function getCollectionName(): string {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name) throw new Error("SESSION_COLLECTION_NAME is not set in the environment");
    return name;
};

export const collection = () => getDbCollection<Session>(getCollectionName());
