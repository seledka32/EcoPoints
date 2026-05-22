import { NextResponse } from 'next/server'
import getMongoClientPromise from '@/lib/server/mongodb'
import { sendVerificationEmail } from '@/lib/server/email'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
    }

    const client = await getMongoClientPromise()
    const db = client.db()

    const user = await db.collection('users').findOne({ email, emailVerified: false })
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден или уже подтверждён' }, { status: 400 })
    }

    // Rate limit: allow resend only after 60 seconds
    const existing = await db.collection('email_verifications').findOne<{ createdAt: Date }>({ email })
    if (existing) {
      const elapsed = Date.now() - new Date(existing.createdAt).getTime()
      if (elapsed < 60_000) {
        const wait = Math.ceil((60_000 - elapsed) / 1000)
        return NextResponse.json(
          { error: `Подождите ${wait} секунд перед повторной отправкой` },
          { status: 429 }
        )
      }
    }

    const code = generateCode()
    await db.collection('email_verifications').deleteMany({ email })
    await db.collection('email_verifications').insertOne({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    })

    await sendVerificationEmail(email, code)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Произошла ошибка' }, { status: 500 })
  }
}
