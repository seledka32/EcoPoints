import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''

  const client = await getMongoClientPromise()
  const db = client.db()

  const upperQuery = query.toUpperCase()
  const filter = query
    ? { $or: [{ email: { $regex: query, $options: 'i' } }, { shortCode: upperQuery }] }
    : {}

  const users = await db
    .collection('users')
    .find(filter, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()

  const userIds = users.map((u) => u._id as ObjectId)

  const pointsDocs = await db
    .collection('points')
    .find({ userId: { $in: userIds } })
    .toArray()

  const balanceMap = new Map(pointsDocs.map((p) => [String(p.userId), p.balance as number]))

  return NextResponse.json(
    users.map((u) => ({
      id: String(u._id),
      email: u.email as string,
      role: (u.role as string | undefined) ?? 'user',
      shortCode: (u.shortCode as string | undefined) ?? null,
      balance: balanceMap.get(String(u._id)) ?? 0,
      createdAt: u.createdAt as Date,
    }))
  )
}
