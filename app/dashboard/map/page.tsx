import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import { DashboardMapContent } from '@/components/dashboard-map-content'

export const dynamic = 'force-dynamic'

export default async function DashboardMapPage() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user) redirect('/auth/login')
  const pointsBalance = await getPointsBalance(session.user.id)
  return <DashboardMapContent user={session.user} pointsBalance={pointsBalance} />
}
