import { MongoClient, Db, Collection } from "mongodb";
import { Session } from "../domain/session";
import "dotenv/config";


let client: MongoClient | null = null; 
let db: Db | null = null;

function validateEnvEntry(envVariableName: string): string {
    const variable = process.env[envVariableName]
    if(!variable) {
        throw new Error(`${envVariableName} is not defined in the .env! Add a .env variable called: ${envVariableName}.`)
    }
        return variable
};

export async function connectToDb() {
    if (db) return db; 
    const uri = validateEnvEntry("DB_CONN_STRING")
    const dbName = validateEnvEntry("DB_NAME")
    client = new MongoClient(uri)
    await client.connect()
    db = client.db(dbName)
    console.log(`SUCCESSFULLY CONNECTED TO ${dbName}`)
    return db
}

export async function isDbHealthy(): Promise<boolean> {
    if (!client) {
        return false;
    }

    try {
        await client.db("admin").command({ ping: 1 });
        return true;
    } catch {
        return false;
    }
}

function getDb(): Db {
    if(!db) {
        throw new Error("Database not initialized. Call connectToDatabase() first.")
    } else{
        return db
    } 
}

function getDbCollection<T = any>(dbCollectionName: string): Collection<T> {
    return getDb().collection<T>(dbCollectionName);
}

function getCollectionName(): string {
    const name = process.env.MONGO_COLLECTION_NAME;
    if (!name) throw new Error("MONGO_COLLECTION_NAME is not set in the environment");
    return name;
};

const collection = () => getDbCollection<Session>(getCollectionName());

export async function insertSessionDoc(sessionId: string, mazeId: number) { 
    const doc: Session = Session.parse({
      sessionId: sessionId,
      mazeId: mazeId,
      createdAt: new Date(),
    });
    await collection().insertOne(doc)
    return doc ;
};

export async function findSessionDoc(sessionId: string) { return await (collection()).findOne({ sessionId }) };

export async function updateSessionDoc(sessionId: string, data: Partial<Session>) {
    const updatedDocument = await collection().findOneAndUpdate(
        { sessionId },
        { $set: data },
        { returnDocument: "after" }
    );

    return updatedDocument ? Session.parse(updatedDocument) : null;
};
