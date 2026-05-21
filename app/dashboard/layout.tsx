import { DashboardBottomNav } from '@/components/dashboard-bottom-nav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <DashboardBottomNav />
    </>
  )
}
