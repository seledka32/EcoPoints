import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { getTransactions } from '@/lib/server/transactions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const [pointsBalance, transactions] = await Promise.all([
    getPointsBalance(session.user.id),
    getTransactions(session.user.id, 5),
  ])

  return (
    <DashboardContent
      user={session.user}
      pointsBalance={pointsBalance}
      transactions={transactions.map((tx) => ({
        id: String(tx._id),
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      }))}
    />
  )
}
