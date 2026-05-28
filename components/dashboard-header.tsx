'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeft, Leaf, LogOut, QrCode, ShieldCheck, MapPin, History, Trophy, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeLanguageSwitcher } from '@/components/theme-language-switcher'
import { useLanguage } from '@/hooks/use-language'

type DashboardHeaderProps = {
  user: { email?: string | null; role?: string }
  variant?: 'main' | 'qr' | 'rewards' | 'map'
  rankEmoji?: string
  rankLabel?: string
}

const NAV_ITEMS = [
  { href: '/dashboard/map',         icon: MapPin,  labelKey: 'nav-map',         exact: false },
  { href: '/dashboard',             icon: History, labelKey: 'nav-history',     exact: true  },
  { href: '/dashboard/qr',          icon: QrCode,  labelKey: null,               exact: false },
  { href: '/dashboard/leaderboard', icon: Trophy,  labelKey: 'nav-leaderboard', exact: false },
  { href: '/dashboard/profile',     icon: User,    labelKey: 'nav-profile',     exact: false },
] as const

export function DashboardHeader({ user, variant = 'main', rankEmoji, rankLabel }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const isNavActive = (href: string, exact: boolean) =>
    exact ? pathname === href : (pathname ?? '').startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {/* ── Left ── */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {variant !== 'main' ? (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 shrink-0 text-muted-foreground hover:text-foreground md:hidden"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">{t('back')}</span>
              </Button>
            </Link>
          ) : null}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:inline">EcoPoints</span>
          </Link>
        </div>

        {/* ── Center: desktop navigation ── */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey, exact }) => {
            const active = isNavActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{labelKey ? t(labelKey) : 'QR'}</span>
              </Link>
            )
          })}
        </nav>

        {/* ── Right ── */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeLanguageSwitcher />
          {rankEmoji && rankLabel && (
            <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 md:inline-flex">
              {rankEmoji} {rankLabel}
            </span>
          )}
          <span className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:inline">
            {user.email}
          </span>
          {variant === 'main' && (user.role === 'admin' || user.role === 'operator') ? (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Админ панель</span>
              </Button>
            </Link>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-border text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
