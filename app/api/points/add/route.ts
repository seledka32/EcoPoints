import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { addPoints } from '@/lib/server/transactions'
import getMongoClientPromise from '@/lib/server/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    userId?: string
    amount?: unknown
    description?: string
    type?: string
  }

  const { userId, amount, description, type = 'admin' } = body

  if (!userId || !amount || !description) {
    return NextResponse.json(
      { error: 'userId, amount, description обязательны' },
      { status: 400 }
    )
  }

  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
    return NextResponse.json(
      { error: 'amount должен быть целым положительным числом' },
      { status: 400 }
    )
  }

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Некорректный userId' }, { status: 400 })
  }

  // Убеждаемся что пользователь существует
  const client = await getMongoClientPromise()
  const db = client.db()
  const targetUser = await db.collection('users').findOne({ _id: new ObjectId(userId) })
  if (!targetUser) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  }

  await addPoints({
    userId,
    amount,
    type: type === 'recycle' ? 'recycle' : 'admin',
    description,
    operatorId: session.user.id,
  })

  return NextResponse.json({ ok: true })
}
