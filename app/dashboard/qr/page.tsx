import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ObjectId } from 'mongodb'
import { DashboardQrContent } from '@/components/dashboard-qr-content'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { getPointsBalance } from '@/lib/server/points'
import getMongoClientPromise from '@/lib/server/mongodb'

export const dynamic = 'force-dynamic'

async function resolveBaseUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

async function getShortCode(userId: string): Promise<string | null> {
  try {
    const client = await getMongoClientPromise()
    const db = client.db()
    const user = await db
      .collection('users')
      .findOne<{ shortCode?: string }>({ _id: new ObjectId(userId) })
    return user?.shortCode ?? null
  } catch {
    return null
  }
}

export default async function DashboardQrPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  const [baseUrl, pointsBalance, shortCode] = await Promise.all([
    resolveBaseUrl(),
    getPointsBalance(session.user.id),
    getShortCode(session.user.id),
  ])

  return (
    <DashboardQrContent
      user={session.user}
      baseUrl={baseUrl}
      pointsBalance={pointsBalance}
      shortCode={shortCode}
    />
  )
}
