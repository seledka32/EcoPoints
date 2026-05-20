import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { getPointsBalance } from '@/lib/points'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const pointsBalance = await getPointsBalance(session.user.id)

  return <DashboardContent user={session.user} pointsBalance={pointsBalance} />
}
