import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'

import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  }

  const body = (await req.json()) as { couponCode?: string }
  const couponCode = body.couponCode?.trim().toUpperCase()
  if (!couponCode) {
    return NextResponse.json({ error: 'couponCode обязателен' }, { status: 400 })
  }

  const client = await getMongoClientPromise()
  const db = client.db()

  const reward = await db.collection('redeemed_rewards').findOne({ couponCode })
  if (!reward) {
    return NextResponse.json({ error: 'Купон не найден' }, { status: 404 })
  }
  if (reward.used) {
    return NextResponse.json({ error: 'Купон уже использован', usedAt: reward.usedAt }, { status: 400 })
  }

  await db.collection('redeemed_rewards').updateOne(
    { couponCode },
    { $set: { used: true, usedAt: new Date(), usedBy: new ObjectId(session.user.id) } }
  )

  return NextResponse.json({
    ok: true,
    rewardKey: reward.rewardKey,
    category: reward.category,
    points: reward.points,
  })
}

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const couponCode = searchParams.get('code')?.trim().toUpperCase()
  if (!couponCode) {
    return NextResponse.json({ error: 'code обязателен' }, { status: 400 })
  }

  const client = await getMongoClientPromise()
  const db = client.db()

  const reward = await db.collection('redeemed_rewards').findOne({ couponCode })
  if (!reward) {
    return NextResponse.json({ error: 'Купон не найден' }, { status: 404 })
  }

  const user = await db.collection('users').findOne({ _id: reward.userId })

  return NextResponse.json({
    rewardKey: reward.rewardKey,
    category: reward.category,
    points: reward.points,
    redeemedAt: reward.redeemedAt,
    used: reward.used ?? false,
    usedAt: reward.usedAt ?? null,
    userEmail: user?.email ?? null,
  })
}
