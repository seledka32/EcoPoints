import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'code обязателен' }, { status: 400 })

  const client = await getMongoClientPromise()
  const db = client.db()

  const user = await db.collection('users').findOne(
    { shortCode: code },
    { projection: { passwordHash: 0 } }
  )
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })

  const pointsDoc = await db
    .collection<{ balance: number }>('points')
    .findOne({ userId: user._id })

  return NextResponse.json({
    id: String(user._id),
    email: user.email as string,
    role: (user.role as string | undefined) ?? 'user',
    shortCode: user.shortCode as string,
    balance: pointsDoc?.balance ?? 0,
  })
}
