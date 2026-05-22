import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { getTransactions, getRedeemedRewards } from '@/lib/server/transactions'

export const dynamic = 'force-dynamic'

function extractKg(description: string): number {
  const match = description.match(/(\d+(?:[.,]\d+)?)\s*кг/i)
  return match ? parseFloat(match[1].replace(',', '.')) : 0
}

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const [pointsBalance, allTransactions, redeemedRewards] = await Promise.all([
    getPointsBalance(session.user.id),
    getTransactions(session.user.id, 100),
    getRedeemedRewards(session.user.id, 100),
  ])

  const kgRecycled = allTransactions
    .filter((tx) => tx.type === 'recycle')
    .reduce((sum, tx) => sum + extractKg(tx.description), 0)

  return (
    <DashboardContent
      user={session.user}
      pointsBalance={pointsBalance}
      kgRecycled={kgRecycled}
      allTransactions={allTransactions.map((tx) => ({
        id: String(tx._id),
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      }))}
      redeemedRewards={redeemedRewards.map((r) => ({
        id: String(r._id),
        rewardKey: r.rewardKey,
        points: r.points,
        category: r.category,
        redeemedAt: r.redeemedAt,
      }))}
    />
  )
}
