import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'

import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'
import { getRank, type RankKey } from '@/lib/ranks'

export const dynamic = 'force-dynamic'

export interface LeaderboardEntry {
  position: number
  userId: string
  displayName: string
  rank: RankKey
  points: number
  isCurrentUser: boolean
  avatarUrl: string | null
}

export interface LeaderboardResponse {
  top20: LeaderboardEntry[]
  currentUser: { position: number; displayName: string; rank: RankKey; points: number; avatarUrl: string | null } | null
  period: string
}

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'alltime'

  const client = await getMongoClientPromise()
  const db = client.db()
  const currentUserId = session.user.id
  const currentUserOid = new ObjectId(currentUserId)

  if (period === 'alltime') {
    // Top 20 from denormalized users.totalPoints
    const top20raw = await db
      .collection('users')
      .find({}, { projection: { displayName: 1, totalPoints: 1, rank: 1, avatarUrl: 1 } })
      .sort({ totalPoints: -1 })
      .limit(20)
      .toArray()

    const top20: LeaderboardEntry[] = top20raw.map((u, i) => ({
      position: i + 1,
      userId: String(u._id),
      displayName: u.displayName ?? (u.email as string | undefined ?? '').split('@')[0] ?? 'Эко-герой',
      rank: (u.rank as RankKey | undefined) ?? 'sprout',
      points: (u.totalPoints as number | undefined) ?? 0,
      isCurrentUser: String(u._id) === currentUserId,
      avatarUrl: (u.avatarUrl as string | null | undefined) ?? null,
    }))

    // Current user data
    const currentUserDoc = await db
      .collection('users')
      .findOne({ _id: currentUserOid }, { projection: { displayName: 1, totalPoints: 1, rank: 1 } })

    const userPoints = (currentUserDoc?.totalPoints as number | undefined) ?? 0
    const aboveCount = await db
      .collection('users')
      .countDocuments({ totalPoints: { $gt: userPoints } })

    const currentUser = {
      position: aboveCount + 1,
      displayName: (currentUserDoc?.displayName as string | undefined) ?? 'Эко-герой',
      rank: ((currentUserDoc?.rank as RankKey | undefined) ?? 'sprout'),
      points: userPoints,
      avatarUrl: (currentUserDoc?.avatarUrl as string | null | undefined) ?? null,
    }

    return NextResponse.json({ top20, currentUser, period } satisfies LeaderboardResponse)
  }

  // Period-based: aggregate from transactions
  const now = new Date()
  const startDate =
    period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  type AggRow = { _id: ObjectId; periodPoints: number; displayName?: string; rank?: string; avatarUrl?: string | null }

  const rows = await db
    .collection('transactions')
    .aggregate<AggRow>([
      { $match: { createdAt: { $gte: startDate }, amount: { $gt: 0 } } },
      { $group: { _id: '$userId', periodPoints: { $sum: '$amount' } } },
      { $sort: { periodPoints: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          periodPoints: 1,
          displayName: '$userDoc.displayName',
          rank: '$userDoc.rank',
          avatarUrl: '$userDoc.avatarUrl',
        },
      },
    ])
    .toArray()

  const top20: LeaderboardEntry[] = rows.map((row, i) => ({
    position: i + 1,
    userId: String(row._id),
    displayName: row.displayName ?? 'Эко-герой',
    rank: (row.rank as RankKey | undefined) ?? getRank(row.periodPoints).key,
    points: row.periodPoints,
    isCurrentUser: String(row._id) === currentUserId,
    avatarUrl: row.avatarUrl ?? null,
  }))

  // Current user's period points + position
  const userPeriodAgg = await db
    .collection('transactions')
    .aggregate<{ total: number }>([
      { $match: { userId: currentUserOid, createdAt: { $gte: startDate }, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    .toArray()

  const userPeriodPoints = userPeriodAgg[0]?.total ?? 0

  const higherCountAgg = await db
    .collection('transactions')
    .aggregate<{ count: number }>([
      { $match: { createdAt: { $gte: startDate }, amount: { $gt: 0 } } },
      { $group: { _id: '$userId', periodPoints: { $sum: '$amount' } } },
      { $match: { periodPoints: { $gt: userPeriodPoints } } },
      { $count: 'count' },
    ])
    .toArray()

  const higherCount = higherCountAgg[0]?.count ?? 0

  const currentUserDoc = await db
    .collection('users')
    .findOne({ _id: currentUserOid }, { projection: { displayName: 1, rank: 1, avatarUrl: 1 } })

  const currentUser = {
    position: higherCount + 1,
    displayName: (currentUserDoc?.displayName as string | undefined) ?? 'Эко-герой',
    rank: ((currentUserDoc?.rank as RankKey | undefined) ?? getRank(userPeriodPoints).key),
    points: userPeriodPoints,
    avatarUrl: (currentUserDoc?.avatarUrl as string | null | undefined) ?? null,
  }

  return NextResponse.json({ top20, currentUser, period } satisfies LeaderboardResponse)
}
