import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import getMongoClientPromise from '@/lib/server/mongodb'
import { generateUniqueShortCode } from '@/lib/server/short-code'
import { sendVerificationEmail } from '@/lib/server/email'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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
    const shortCode = await generateUniqueShortCode(db)

    const displayName = email.split('@')[0].slice(0, 30)

    // Create user with emailVerified: false (requires verification)
    await db.collection('users').insertOne({
      email,
      passwordHash,
      role: 'user',
      shortCode,
      displayName,
      totalPoints: 0,
      rank: 'sprout',
      team: null,
      emailVerified: false,
      createdAt: new Date(),
    })

    // Generate and store verification code (expires in 15 min)
    const code = generateCode()
    await db.collection('email_verifications').deleteMany({ email })
    await db.collection('email_verifications').insertOne({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
    })

    // Send verification email
    await sendVerificationEmail(email, code)

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Произошла ошибка'
    // Email send errors (Resend)
    if (message.includes('RESEND_API_KEY') || message.includes('Resend error') || message.includes('SMTP') || message.includes('credentials not configured')) {
      return NextResponse.json({ error: 'Ошибка отправки письма. Проверьте настройки почты.' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Произошла ошибка' }, { status: 500 })
  }
}
