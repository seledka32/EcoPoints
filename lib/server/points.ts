import { ObjectId } from 'mongodb'

import getMongoClientPromise from '@/lib/server/mongodb'

export async function getPointsBalance(userId: string): Promise<number> {
  try {
    const client = await getMongoClientPromise()
    const db = client.db()
    const doc = await db.collection('points').findOne<{ balance: number }>({
      userId: new ObjectId(userId),
    })
    return typeof doc?.balance === 'number' ? doc.balance : 0
  } catch {
    return 0
  }
}
