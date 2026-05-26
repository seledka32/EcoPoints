import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import getMongoClientPromise from '@/lib/server/mongodb'
import { generateUniqueShortCode } from '@/lib/server/short-code'
import { addPoints } from '@/lib/server/transactions'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; displayName?: string }

    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен содержать минимум 6 символов' }, { status: 400 })
    }

    const client = await getMongoClientPromise()
    const db = client.db()

    const existing = await db.collection('users').findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 })
    }

    const passwordHash = await hash(password, 10)
    const shortCode = await generateUniqueShortCode(db)
    const displayName = (body.displayName?.trim() || email.split('@')[0]).slice(0, 30)

    const { insertedId } = await db.collection('users').insertOne({
      email,
      passwordHash,
      role: 'user',
      shortCode,
      displayName,
      totalPoints: 0,
      rank: 'sprout',
      team: null,
      emailVerified: true,
      createdAt: new Date(),
    })

    await addPoints({
      userId: insertedId,
      amount: 100,
      type: 'bonus',
      description: 'Приветственный бонус',
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Произошла ошибка' }, { status: 500 })
  }
}
