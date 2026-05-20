import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import getMongoClientPromise from '@/lib/mongodb'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string
      password?: string
    }

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

    const insertRes = await db.collection('users').insertOne({
      email,
      passwordHash,
      createdAt: new Date(),
    })

    await db.collection('points').insertOne({
      userId: insertRes.insertedId,
      balance: 100,
      updatedAt: new Date(),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Произошла ошибка' }, { status: 500 })
  }
}

