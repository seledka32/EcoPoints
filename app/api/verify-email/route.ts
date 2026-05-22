import { NextResponse } from 'next/server'
import getMongoClientPromise from '@/lib/server/mongodb'
import { addPoints } from '@/lib/server/transactions'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; code?: string }
    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email и код обязательны' }, { status: 400 })
    }

    const client = await getMongoClientPromise()
    const db = client.db()

    const record = await db.collection('email_verifications').findOne<{
      email: string
      code: string
      expiresAt: Date
    }>({ email })

    if (!record) {
      return NextResponse.json({ error: 'Код не найден. Запросите новый.' }, { status: 400 })
    }

    if (new Date() > new Date(record.expiresAt)) {
      await db.collection('email_verifications').deleteOne({ email })
      return NextResponse.json({ error: 'Код истёк. Запросите новый.' }, { status: 400 })
    }

    if (record.code !== code) {
      return NextResponse.json({ error: 'Неверный код' }, { status: 400 })
    }

    // Mark user as verified
    const updateResult = await db.collection('users').updateOne(
      { email, emailVerified: false },
      { $set: { emailVerified: true } }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const user = await db.collection<{ _id: unknown }>('users').findOne({ email })

    // Award welcome points
    await addPoints({
      userId: user!._id,
      amount: 100,
      type: 'bonus',
      description: 'Приветственный бонус',
    })

    // Cleanup verification record
    await db.collection('email_verifications').deleteOne({ email })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Произошла ошибка' }, { status: 500 })
  }
}
