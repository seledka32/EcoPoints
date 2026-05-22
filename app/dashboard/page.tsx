import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { getTransactions, getRedeemedRewards, WasteItem } from '@/lib/server/transactions'

export const dynamic = 'force-dynamic'

function txTotalKg(wasteItems: WasteItem[] | undefined, description: string): number {
  if (wasteItems && wasteItems.length > 0) {
    return wasteItems.reduce((s, i) => s + i.kg, 0)
  }
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

  const recycleTx = allTransactions.filter((tx) => tx.type === 'recycle')

  const kgRecycled = recycleTx.reduce(
    (sum, tx) => sum + txTotalKg(tx.wasteItems, tx.description),
    0
  )

  const kgByMaterial: Record<string, number> = {}
  recycleTx.forEach((tx) => {
    if (tx.wasteItems && tx.wasteItems.length > 0) {
      tx.wasteItems.forEach((item) => {
        kgByMaterial[item.material] = (kgByMaterial[item.material] ?? 0) + item.kg
      })
    }
  })

  return (
    <DashboardContent
      user={session.user}
      pointsBalance={pointsBalance}
      kgRecycled={kgRecycled}
      kgByMaterial={kgByMaterial}
      allTransactions={allTransactions.map((tx) => ({
        id: String(tx._id),
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        wasteItems: tx.wasteItems,
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
