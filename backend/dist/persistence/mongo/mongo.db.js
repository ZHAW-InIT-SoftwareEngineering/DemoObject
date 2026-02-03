"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = exports.SessionDb = void 0;
const mongodb_1 = require("mongodb");
const session_1 = require("../../domain/session");
const zod_1 = require("zod");
const mongo_1 = require("../../db/mongo");
exports.SessionDb = session_1.Session.extend({
    _id: zod_1.z.instanceof(mongodb_1.ObjectId),
});
function getCollectionName() {
    const name = process.env.SESSION_COLLECTION_NAME;
    if (!name)
        throw new Error("SESSION_COLLECTION_NAME is not set in the environment");
    return name;
}
;
const collection = () => (0, mongo_1.getDbCollection)(getCollectionName());
exports.collection = collection;
