import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ObjectId } from 'mongodb'
import { getAuthOptions } from '@/lib/server/auth'
import getMongoClientPromise from '@/lib/server/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user?.id) {
    return NextResponse.json({ avatarUrl: null })
  }
  const client = await getMongoClientPromise()
  const db = client.db()
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.user.id) },
    { projection: { avatarUrl: 1 } },
  )
  return NextResponse.json({
    avatarUrl: (user?.avatarUrl as string | null | undefined) ?? null,
  })
}
