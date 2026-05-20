import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { getPointsBalance } from '@/lib/points'
import { DashboardRewardsContent } from '@/components/dashboard-rewards-content'

export const dynamic = 'force-dynamic'

export default async function DashboardRewardsPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const pointsBalance = await getPointsBalance(session.user.id)

  return <DashboardRewardsContent user={session.user} pointsBalance={pointsBalance} />
}
