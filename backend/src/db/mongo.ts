import { MongoClient, Db, Collection } from "mongodb"; 
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

// currently db and connection uri is hard wired => however only one Db needed atm
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

export function getDb(): Db {
    if(!db) {
        throw new Error("Database not initialized. Call connectToDatabase() first.")
    } else{
        return db
    } 
}

export function getDbCollection<T = any>(dbCollectionName: string): Collection<T> {
    return getDb().collection<T>(dbCollectionName);
}