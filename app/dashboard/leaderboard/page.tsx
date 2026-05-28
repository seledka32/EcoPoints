import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { getTransactions, type WasteItem } from '@/lib/server/transactions'
import { LeaderboardContent } from '@/components/leaderboard-content'

export const dynamic = 'force-dynamic'

function txTotalKg(wasteItems: WasteItem[] | undefined, description: string): number {
  if (wasteItems && wasteItems.length > 0) return wasteItems.reduce((s, i) => s + i.kg, 0)
  const match = description.match(/(\d+(?:[.,]\d+)?)\s*кг/i)
  return match ? parseFloat(match[1].replace(',', '.')) : 0
}

export default async function LeaderboardPage() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user) redirect('/auth/login')

  const [pointsBalance, allTransactions] = await Promise.all([
    getPointsBalance(session.user.id),
    getTransactions(session.user.id, 500),
  ])

  const recycleTx = allTransactions.filter((tx) => tx.type === 'recycle')
  const kgRecycled =
    Math.round(recycleTx.reduce((sum, tx) => sum + txTotalKg(tx.wasteItems, tx.description), 0) * 10) / 10
  const totalEarned = allTransactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)

  return (
    <LeaderboardContent
      currentUserId={session.user.id}
      pointsBalance={pointsBalance}
      kgRecycled={kgRecycled}
      transactionCount={allTransactions.length}
      totalEarned={totalEarned}
    />
  )
}
