import { ObjectId } from 'mongodb'
import getMongoClientPromise from '@/lib/server/mongodb'

export type TransactionType = 'recycle' | 'reward' | 'bonus' | 'admin'

export interface WasteItem {
  material: string
  kg: number
}

export interface Transaction {
  _id: ObjectId
  userId: ObjectId
  amount: number
  type: TransactionType
  description: string
  wasteItems?: WasteItem[]
  operatorId?: ObjectId
  createdAt: Date
}

export async function addPoints({
  userId,
  amount,
  type,
  description,
  wasteItems,
  operatorId,
}: {
  userId: string | ObjectId
  amount: number
  type: TransactionType
  description: string
  wasteItems?: WasteItem[]
  operatorId?: string | ObjectId
}): Promise<void> {
  const client = await getMongoClientPromise()
  const db = client.db()
  const userOid = typeof userId === 'string' ? new ObjectId(userId) : userId
  const opOid =
    operatorId != null
      ? typeof operatorId === 'string'
        ? new ObjectId(operatorId)
        : operatorId
      : undefined

  await Promise.all([
    db.collection('transactions').insertOne({
      userId: userOid,
      amount,
      type,
      description,
      ...(wasteItems && wasteItems.length > 0 ? { wasteItems } : {}),
      ...(opOid ? { operatorId: opOid } : {}),
      createdAt: new Date(),
    }),
    db.collection('points').updateOne(
      { userId: userOid },
      { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
      { upsert: true }
    ),
  ])
}

export async function getTransactions(userId: string, limit = 20): Promise<Transaction[]> {
  const client = await getMongoClientPromise()
  const db = client.db()
  return db
    .collection<Transaction>('transactions')
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export interface RedeemedReward {
  _id: ObjectId
  userId: ObjectId
  rewardKey: string
  points: number
  category: string
  redeemedAt: Date
}

export async function getRedeemedRewards(userId: string, limit = 100): Promise<RedeemedReward[]> {
  const client = await getMongoClientPromise()
  const db = client.db()
  return db
    .collection<RedeemedReward>('redeemed_rewards')
    .find({ userId: new ObjectId(userId) })
    .sort({ redeemedAt: -1 })
    .limit(limit)
    .toArray()
}
