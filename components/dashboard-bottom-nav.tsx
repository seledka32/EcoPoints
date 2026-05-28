'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, History, QrCode, Trophy, User } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

export function DashboardBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : (pathname ?? '').startsWith(href)

  const LEFT_NAV = [
    { href: '/dashboard/map', icon: MapPin,  label: t('nav-map'),         exact: false },
    { href: '/dashboard',     icon: History, label: t('nav-history'),     exact: true  },
  ]

  const RIGHT_NAV = [
    { href: '/dashboard/leaderboard', icon: Trophy, label: t('nav-leaderboard'), exact: false },
    { href: '/dashboard/profile',     icon: User,   label: t('nav-profile'),     exact: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl md:hidden">
      <div
        className="flex items-end justify-around px-2 pt-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {LEFT_NAV.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-colors ${
              isActive(href, exact) ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(href, exact) ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* QR center floating button */}
        <Link href="/dashboard/qr" className="relative -mt-5 flex flex-col items-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 ${
              pathname === '/dashboard/qr'
                ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-background'
                : ''
            }`}
          >
            <QrCode className="h-6 w-6 stroke-[2.5] text-black" />
          </div>
          <span className="mt-1 text-[10px] font-medium text-muted-foreground">QR</span>
        </Link>

        {RIGHT_NAV.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-colors ${
              isActive(href, exact) ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(href, exact) ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
