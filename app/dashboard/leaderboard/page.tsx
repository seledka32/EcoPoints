import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { LeaderboardContent } from '@/components/leaderboard-content'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const session = await getServerSession(getAuthOptions())
  if (!session?.user) redirect('/auth/login')

  return <LeaderboardContent currentUserId={session.user.id} />
}
