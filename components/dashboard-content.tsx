'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard-header'
import { Gift, Recycle, MapPin, Trophy, TrendingUp, Star } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

interface DashboardContentProps {
  user: { email?: string | null }
  pointsBalance: number
}

export function DashboardContent({ user, pointsBalance }: DashboardContentProps) {
  const { t } = useLanguage()

  const stats = [
    { labelKey: 'points-label', value: pointsBalance.toLocaleString('ru-RU'), icon: Star, color: 'from-yellow-400 to-orange-400' },
    { labelKey: 'kg-recycled', value: '48.5', icon: Recycle, color: 'from-emerald-400 to-cyan-400' },
    { labelKey: 'rewards-count', value: '12', icon: Trophy, color: 'from-purple-400 to-pink-400' },
  ]

  const recentActivity = [
    { type: 'recycle', descKey: 'act-plastic', points: '+150', timeKey: 'time-2h' },
    { type: 'reward', descKey: 'act-discount-cafe', points: '-500', timeKey: 'time-yesterday' },
    { type: 'recycle', descKey: 'act-paper', points: '+90', timeKey: 'time-3d' },
    { type: 'bonus', descKey: 'act-bonus', points: '+100', timeKey: 'time-week' },
  ]

  const availableRewards = [
    { nameKey: 'reward-perekrestok', points: 300, categoryKey: 'cat-grocery' },
    { nameKey: 'reward-starbucks', points: 200, categoryKey: 'cat-cafe' },
    { nameKey: 'reward-ozon', points: 500, categoryKey: 'cat-online' },
  ]

  const comingSoon = (title: string) =>
    toast.message(title, { description: 'Раздел появится в следующем обновлении.' })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} variant="main" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{t('welcome')}</h1>
            <p className="text-muted-foreground">{t('track-progress')}</p>
          </div>
          <Link
            href="/dashboard/qr"
            className="text-sm text-cyan-500 hover:text-cyan-400 sm:hidden"
          >
            {t('qr-and-balance')}
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6 text-black" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">{t('recent-activity')}</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border/50 py-3 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        activity.type === 'recycle'
                          ? 'bg-emerald-500/20'
                          : activity.type === 'reward'
                            ? 'bg-purple-500/20'
                            : 'bg-yellow-500/20'
                      }`}
                    >
                      {activity.type === 'recycle' ? (
                        <Recycle className="h-5 w-5 text-emerald-500" />
                      ) : activity.type === 'reward' ? (
                        <Gift className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Star className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t(activity.descKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(activity.timeKey)}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      activity.points.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {activity.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">{t('available-rewards')}</h2>
            <div className="space-y-4">
              {availableRewards.map((reward, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => comingSoon('Награды')}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/30 p-4 text-left transition-colors hover:border-emerald-500/30"
                >
                  <div>
                    <p className="mb-1 font-medium text-foreground">{t(reward.nameKey)}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {t(reward.categoryKey)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">{reward.points}</p>
                    <p className="text-xs text-muted-foreground">{t('points-word')}</p>
                  </div>
                </button>
              ))}
            </div>
            <Link href="/dashboard/rewards" className="mt-6 block">
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-600 hover:to-cyan-600"
              >
                <Gift className="mr-2 h-4 w-4" />
                {t('all-rewards')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
                <MapPin className="h-7 w-7 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{t('find-dropoff')}</h3>
                <p className="text-muted-foreground">{t('dropoff-count')}</p>
              </div>
            </div>
            <Button
              type="button"
              className="bg-foreground font-semibold text-background hover:bg-foreground/90"
              onClick={() => comingSoon('Карта пунктов')}
            >
              {t('open-map')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
