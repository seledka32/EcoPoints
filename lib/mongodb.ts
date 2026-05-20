import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined
}

export function getMongoClientPromise() {
  if (!global.__mongoClientPromise) {
    if (!uri) {
      throw new Error('Missing MONGODB_URI')
    }

    const client = new MongoClient(uri)
    global.__mongoClientPromise = client.connect().then(() => client)
  }

  return global.__mongoClientPromise
}

export async function getDb(dbName?: string) {
  const connectedClient = await getMongoClientPromise()
  return connectedClient.db(dbName)
}

export default getMongoClientPromise
