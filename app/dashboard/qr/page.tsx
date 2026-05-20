import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DashboardQrContent } from '@/components/dashboard-qr-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/auth'
import { getPointsBalance } from '@/lib/points'

export const dynamic = 'force-dynamic'

async function resolveBaseUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export default async function DashboardQrPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const baseUrl = await resolveBaseUrl()
  const pointsBalance = await getPointsBalance(session.user.id)

  return (
    <DashboardQrContent
      user={session.user}
      baseUrl={baseUrl}
      pointsBalance={pointsBalance}
    />
  )
}
