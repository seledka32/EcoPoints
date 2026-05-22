import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'

import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

export async function GET() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const client = await getMongoClientPromise()
  const db = client.db()

  const rewards = await db
    .collection<{
      _id: ObjectId
      rewardKey: string
      points: number
      category: string
      redeemedAt: Date
      couponCode?: string
      used?: boolean
    }>('redeemed_rewards')
    .find({ userId: new ObjectId(session.user.id) })
    .sort({ redeemedAt: -1 })
    .limit(50)
    .toArray()

  return NextResponse.json(
    rewards.map((r) => ({
      id: r._id.toString(),
      rewardKey: r.rewardKey,
      points: r.points,
      category: r.category,
      redeemedAt: r.redeemedAt,
      couponCode: r.couponCode ?? null,
      used: r.used ?? false,
    }))
  )
}
