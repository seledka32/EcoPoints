'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { ArrowLeft, Leaf, LogOut, QrCode, ShieldCheck, MapPin, History, Trophy, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeLanguageSwitcher } from '@/components/theme-language-switcher'
import { useLanguage } from '@/hooks/use-language'

type DashboardHeaderProps = {
  user: { email?: string | null; role?: string; avatarUrl?: string | null }
  variant?: 'main' | 'qr' | 'rewards' | 'map'
  rankEmoji?: string
  rankLabel?: string
}

const NAV_ITEMS = [
  { href: '/dashboard/map',         icon: MapPin,  labelKey: 'nav-map',         exact: false },
  { href: '/dashboard',             icon: History, labelKey: 'nav-history',     exact: true  },
  { href: '/dashboard/qr',          icon: QrCode,  labelKey: null,              exact: false },
  { href: '/dashboard/leaderboard', icon: Trophy,  labelKey: 'nav-leaderboard', exact: false },
  { href: '/dashboard/profile',     icon: User,    labelKey: 'nav-profile',     exact: false },
] as const

const CACHE_KEY = 'eco-user-avatar'

export function DashboardHeader({ user, variant = 'main', rankEmoji, rankLabel }: DashboardHeaderProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const { t }    = useLanguage()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // If parent passes avatarUrl explicitly, use it and update cache
    if (user.avatarUrl !== undefined) {
      const url = user.avatarUrl ?? null
      setAvatarUrl(url)
      try { sessionStorage.setItem(CACHE_KEY, url ?? '') } catch { /* ssr */ }
      return
    }

    // Try sessionStorage cache first (avoids fetch on every nav)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached !== null) {
        setAvatarUrl(cached || null)
        return
      }
    } catch { /* ssr */ }

    // Fetch from server
    fetch('/api/me/avatar')
      .then((r) => r.json())
      .then((d: { avatarUrl: string | null }) => {
        const url = d.avatarUrl ?? null
        setAvatarUrl(url)
        try { sessionStorage.setItem(CACHE_KEY, url ?? '') } catch { /* ssr */ }
      })
      .catch(() => {})
  }, [user.avatarUrl])

  const handleSignOut = async () => {
    try { sessionStorage.removeItem(CACHE_KEY) } catch { /* ssr */ }
    await signOut({ redirect: false })
    router.push('/')
  }

  const isNavActive = (href: string, exact: boolean) =>
    exact ? pathname === href : (pathname ?? '').startsWith(href)

  const email    = user.email ?? ''
  const initials = email.split('@')[0]?.slice(0, 2).toUpperCase() || '?'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">

        {/* ── Left ── */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {variant !== 'main' && (
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
          )}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:inline">EcoPoints</span>
          </Link>
        </div>

        {/* ── Center: desktop nav ── */}
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

          <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground md:inline">
            {user.email}
          </span>

          {variant === 'main' && (user.role === 'admin' || user.role === 'operator') && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Админ</span>
              </Button>
            </Link>
          )}

          {/* User avatar → links to profile */}
          <Link href="/dashboard/profile" title="Профиль">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-border bg-emerald-500/20 transition-opacity hover:opacity-80">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-emerald-400">
                  {initials}
                </span>
              )}
            </div>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleSignOut()}
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
