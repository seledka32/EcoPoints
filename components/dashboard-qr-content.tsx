'use client'

import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { QrCode, Star, Gift, Copy, Check } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard-header'
import { useLanguage } from '@/hooks/use-language'

interface DashboardQrContentProps {
  user: { id: string; email?: string | null; role?: string }
  baseUrl: string
  pointsBalance: number
  shortCode: string | null
}

export function DashboardQrContent({
  user,
  baseUrl,
  pointsBalance,
  shortCode,
}: DashboardQrContentProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const inviteSlug = user.id.slice(0, 8).toUpperCase()
  const invitePayload = `${baseUrl}/auth/sign-up?ref=${inviteSlug}`

  const handleCopy = () => {
    if (!shortCode) return
    navigator.clipboard.writeText(shortCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} variant="qr" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-500">
              <QrCode className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">{t('qr-and-points')}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('your-ecopoints-card')}</h1>
            <p className="mt-1 text-muted-foreground">{t('show-code')}</p>
          </div>
          <Link href="/dashboard" className="text-sm text-cyan-500 hover:text-cyan-400">
            {t('open-cabinet')}
          </Link>
        </div>

        {/* Balance */}
        <div className="mb-8 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400">
                <Star className="h-7 w-7 text-black" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('balance')}</p>
                <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                  {pointsBalance.toLocaleString('ru-RU')}
                </p>
                <p className="text-sm text-emerald-500">{t('points-available')}</p>
              </div>
            </div>
            <p className="max-w-xs text-xs text-muted-foreground sm:text-sm">
              Покажите QR-код или быстрый код оператору для начисления баллов
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Member card */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-foreground">{t('member-card')}</h2>
            </div>
            <p className="mb-4 flex-1 text-sm text-muted-foreground">{t('member-card-desc')}</p>

            {shortCode ? (
              <>
                <div className="mx-auto rounded-2xl bg-white p-4 shadow-xl">
                  <QRCode value={shortCode} size={200} fgColor="#0a0a0a" bgColor="#ffffff" />
                </div>

                {/* Короткий код */}
                <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <p className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Быстрый код
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-3xl font-bold tracking-[0.2em] text-foreground">
                      {shortCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Продиктуйте код оператору
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Код недоступен. Обратитесь в поддержку.</p>
              </div>
            )}
          </div>

          {/* Invite card */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-cyan-500" />
              <h2 className="text-lg font-semibold text-foreground">{t('invite-friend')}</h2>
            </div>
            <p className="mb-6 flex-1 text-sm text-muted-foreground">{t('invite-friend-desc')}</p>
            <div className="mx-auto rounded-2xl bg-white p-4 shadow-xl">
              <QRCode value={invitePayload} size={200} fgColor="#0a0a0a" bgColor="#ffffff" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t('invite-code')}:{' '}
              <span className="font-mono font-semibold text-foreground">{inviteSlug}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
