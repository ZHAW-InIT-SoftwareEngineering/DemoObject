import { z } from "zod";
import { Path } from "./path";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { SessionPublic } from "../models/session";
extendZodWithOpenApi(z);

const SessionApiShape = SessionPublic.omit({ createdAt: true }).extend({
    expiresAt: z.coerce.date().optional(),
});

export const StorePathRequest = z.object({
    path: Path,
});

export const StorePathResponse = SessionApiShape.pick({
    mazeId: true,
    path: true,
    dsl: true,
});

export const RetrievePathRequest = z.object({
    sessionId: z.uuid(),
});

export const RetrievePathResponse = SessionApiShape.pick({
    mazeId: true,
    path: true,
    dsl: true,
});

export const UpdatePathRequest = SessionApiShape.omit( {sessionId: true, mazeId: true}).partial();

export const UpdatePathResponse = SessionApiShape;
