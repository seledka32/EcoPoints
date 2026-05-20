"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, LayoutDashboard, LogOut } from "lucide-react"
import { ThemeLanguageSwitcher } from "@/components/theme-language-switcher"
import { useLanguage } from "@/hooks/use-language"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const { t } = useLanguage()

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group" onClick={closeMobile}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                <Leaf className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                EcoPoints
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('how-it-works')}
              </Link>
              <Link href="/#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('benefits')}
              </Link>
              <Link href="/#partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('partners')}
              </Link>
              <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('faq')}
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeLanguageSwitcher />
              {status === "loading" ? (
                <div className="h-9 w-28 rounded-md bg-muted/80 animate-pulse" aria-hidden />
              ) : session?.user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/60"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-medium shadow-lg shadow-emerald-500/25">
                      {t('start')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('close_menu') : t('open_menu')}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2">
          <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 px-6 py-4 space-y-1">
            <Link href="/#how-it-works" className="block py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={closeMobile}>
              {t('how-it-works')}
            </Link>
            <Link href="/#benefits" className="block py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={closeMobile}>
              {t('benefits')}
            </Link>
            <Link href="/#partners" className="block py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={closeMobile}>
              {t('partners')}
            </Link>
            <Link href="/#faq" className="block py-3 text-muted-foreground hover:text-foreground transition-colors" onClick={closeMobile}>
              {t('faq')}
            </Link>
            <div className="pt-4 flex flex-col gap-2">
              {status === "loading" ? (
                <div className="h-10 w-full rounded-md bg-muted/80 animate-pulse" />
              ) : session?.user ? (
                <>
                  <Link href="/dashboard" onClick={closeMobile}>
                    <Button variant="ghost" className="w-full justify-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      closeMobile()
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={closeMobile}>
                    <Button variant="ghost" className="w-full justify-center">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={closeMobile}>
                    <Button className="w-full justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-medium">
                      {t('start')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
