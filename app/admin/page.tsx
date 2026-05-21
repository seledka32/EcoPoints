import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getAuthOptions } from '@/lib/server/auth'
import { AdminContent } from '@/components/admin-content'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(getAuthOptions())

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    redirect('/dashboard')
  }

  return <AdminContent adminEmail={session.user.email ?? ''} />
}
