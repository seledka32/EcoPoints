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
    wasteItems?: { material: string; kg: number }[]
  }

  const { userId, amount, description, type = 'admin', wasteItems } = body

  const isRecycle = type === 'recycle' || (wasteItems && wasteItems.length > 0)

  if (!userId || !amount) {
    return NextResponse.json(
      { error: 'userId, amount обязательны' },
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

  // Auto-generate description from wasteItems if not provided
  const MATERIAL_LABELS: Record<string, string> = {
    plastic: 'Пластик', paper: 'Бумага', glass: 'Стекло',
    metal: 'Металл', electronics: 'Электроника', organic: 'Органика',
  }
  const resolvedDescription = (() => {
    if (description?.trim()) return description.trim()
    if (wasteItems && wasteItems.length > 0) {
      return wasteItems
        .map((i) => `${MATERIAL_LABELS[i.material] ?? i.material} ${i.kg} кг`)
        .join(', ')
    }
    return 'Начисление баллов'
  })()

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
    type: isRecycle ? 'recycle' : 'admin',
    description: resolvedDescription,
    wasteItems: isRecycle && wasteItems && wasteItems.length > 0 ? wasteItems : undefined,
    operatorId: session.user.id,
  })

  return NextResponse.json({ ok: true })
}
