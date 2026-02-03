import { ObjectId } from "mongodb";
import { Session } from "../../domain/session";
import { z } from "zod";


export const SessionDb = Session.extend({
_id: z.instanceof(ObjectId),
});

export type SessionDb = z.infer<typeof SessionDb>;
