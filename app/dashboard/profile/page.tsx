import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { getTransactions, WasteItem } from '@/lib/server/transactions'
import { ProfileContent } from '@/components/profile-content'

export const dynamic = 'force-dynamic'

function txTotalKg(wasteItems: WasteItem[] | undefined, description: string): number {
  if (wasteItems && wasteItems.length > 0) return wasteItems.reduce((s, i) => s + i.kg, 0)
  const match = description.match(/(\d+(?:[.,]\d+)?)\s*кг/i)
  return match ? parseFloat(match[1].replace(',', '.')) : 0
}

export default async function ProfilePage() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user) redirect('/auth/login')

  const [pointsBalance, allTransactions] = await Promise.all([
    getPointsBalance(session.user.id),
    getTransactions(session.user.id, 200),
  ])

  const recycleTx = allTransactions.filter((tx) => tx.type === 'recycle')
  const kgRecycled = recycleTx.reduce((sum, tx) => sum + txTotalKg(tx.wasteItems, tx.description), 0)
  const co2Saved = Math.round(kgRecycled * 2.5 * 10) / 10

  return (
    <ProfileContent
      userId={session.user.id}
      email={session.user.email ?? ''}
      pointsBalance={pointsBalance}
      kgRecycled={Math.round(kgRecycled * 10) / 10}
      co2Saved={co2Saved}
      transactionCount={allTransactions.length}
    />
  )
}
