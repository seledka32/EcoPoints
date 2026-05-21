'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, QrCode, MapPin, Gift } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: Home, label: 'Главная' },
  { href: '/dashboard/qr', icon: QrCode, label: 'QR-код' },
  { href: '/dashboard/map', icon: MapPin, label: 'Карта' },
  { href: '/dashboard/rewards', icon: Gift, label: 'Награды' },
]

export function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl md:hidden">
      <div
        className="flex items-center justify-around px-1 pt-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-5 py-1.5 transition-colors ${
                active
                  ? 'text-emerald-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
