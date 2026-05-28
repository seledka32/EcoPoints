import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'

import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await getMongoClientPromise()
  const db = client.db()
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { displayName: 1, rank: 1, totalPoints: 1, team: 1, email: 1, avatarUrl: 1 } },
  )

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const email = (user.email as string | undefined) ?? session.user.email ?? ''
  const displayName = (user.displayName as string | undefined) ?? email.split('@')[0]

  return NextResponse.json({
    displayName,
    rank: (user.rank as string | undefined) ?? 'sprout',
    totalPoints: (user.totalPoints as number | undefined) ?? 0,
    team: (user.team as string | null | undefined) ?? null,
    email,
    avatarUrl: (user.avatarUrl as string | null | undefined) ?? null,
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { displayName?: string; avatarUrl?: string | null }

  const update: Record<string, unknown> = {}

  if ('displayName' in body) {
    const displayName = body.displayName?.trim()
    if (!displayName || displayName.length < 2 || displayName.length > 30) {
      return NextResponse.json({ error: 'Имя должно содержать от 2 до 30 символов' }, { status: 400 })
    }
    update.displayName = displayName
  }

  if ('avatarUrl' in body) {
    const url = body.avatarUrl
    if (url === null) {
      update.avatarUrl = null
    } else if (
      typeof url === 'string' &&
      /^data:image\/(jpeg|png|webp);base64,/.test(url) &&
      url.length <= 250_000
    ) {
      update.avatarUrl = url
    } else {
      return NextResponse.json({ error: 'Недопустимый формат изображения' }, { status: 400 })
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Нечего обновлять' }, { status: 400 })
  }

  const client = await getMongoClientPromise()
  const db = client.db()
  await db.collection('users').updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: update },
  )

  return NextResponse.json({ ok: true, ...('displayName' in update ? { displayName: update.displayName } : {}) })
}
