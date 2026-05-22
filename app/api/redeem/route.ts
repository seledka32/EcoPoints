import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'

import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

const COUPON_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function generateCouponCode(): string {
  let code = ''
  for (let i = 0; i < 8; i++) code += COUPON_CHARS[Math.floor(Math.random() * COUPON_CHARS.length)]
  return code
}

// Mirror of rewards list — single source of truth for validation
const REWARDS: Record<string, { points: number; category: string }> = {
  'reward-perekrestok':  { points: 300,  category: 'grocery' },
  'reward-starbucks':    { points: 200,  category: 'cafe' },
  'reward-ozon':         { points: 500,  category: 'online' },
  'reward-kofemainia':   { points: 400,  category: 'cafe' },
  'reward-worldclass':   { points: 1200, category: 'sport' },
  'reward-vkusvill':     { points: 250,  category: 'grocery' },
  'reward-yandex':       { points: 350,  category: 'transport' },
  'reward-lamoda':       { points: 600,  category: 'online' },
  'reward-fitnesshouse': { points: 900,  category: 'sport' },
  'reward-magnit':       { points: 200,  category: 'grocery' },
  'reward-costa':        { points: 180,  category: 'cafe' },
  'reward-scooter':      { points: 300,  category: 'transport' },
}

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = (await req.json()) as { rewardKey?: string }
  const rewardKey = body.rewardKey

  if (!rewardKey || !REWARDS[rewardKey]) {
    return NextResponse.json({ error: 'Награда не найдена' }, { status: 400 })
  }

  const reward = REWARDS[rewardKey]
  const userOid = new ObjectId(session.user.id)

  const client = await getMongoClientPromise()
  const db = client.db()

  // Atomically deduct points only if balance is sufficient
  const pointsResult = await db.collection('points').findOneAndUpdate(
    { userId: userOid, balance: { $gte: reward.points } },
    {
      $inc: { balance: -reward.points },
      $set: { updatedAt: new Date() },
    },
    { returnDocument: 'after' }
  ) as unknown as { balance: number } | null

  if (!pointsResult) {
    return NextResponse.json({ error: 'Недостаточно баллов' }, { status: 400 })
  }

  const now = new Date()

  // Record transaction and redeemed reward in parallel
  await Promise.all([
    db.collection('transactions').insertOne({
      userId: userOid,
      amount: -reward.points,
      type: 'reward',
      description: rewardKey,
      createdAt: now,
    }),
    db.collection('redeemed_rewards').insertOne({
      userId: userOid,
      rewardKey,
      points: reward.points,
      category: reward.category,
      redeemedAt: now,
      couponCode: generateCouponCode(),
      used: false,
    }),
  ])

  return NextResponse.json({ ok: true, newBalance: pointsResult.balance })
}
