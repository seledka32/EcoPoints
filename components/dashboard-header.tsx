'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ArrowLeft, Leaf, LogOut, QrCode, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ThemeLanguageSwitcher } from '@/components/theme-language-switcher'
import { useLanguage } from '@/hooks/use-language'

type DashboardHeaderProps = {
  user: { email?: string | null; role?: string }
  variant?: 'main' | 'qr' | 'rewards' | 'map'
}

export function DashboardHeader({ user, variant = 'main' }: DashboardHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          {variant !== 'main' ? (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('back')}</span>
              </Button>
            </Link>
          ) : null}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:inline">EcoPoints</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeLanguageSwitcher />
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
          ) : variant === 'main' ? (
            <Link href="/dashboard/qr">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <QrCode className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('qr-and-points')}</span>
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
