import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getTransactions } from '@/lib/server/transactions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transactions = await getTransactions(session.user.id)

  return NextResponse.json(
    transactions.map((tx) => ({
      id: String(tx._id),
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      createdAt: tx.createdAt,
    }))
  )
}
