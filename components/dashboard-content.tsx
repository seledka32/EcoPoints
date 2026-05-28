'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard-header'
import {
  Gift, Recycle, MapPin, Trophy, TrendingUp, Star,
  ChevronRight, CheckCircle2, Coins, Clock,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useLanguage } from '@/hooks/use-language'
import { useState } from 'react'

interface WasteItem {
  material: string
  kg: number
}

interface TxItem {
  id: string
  amount: number
  type: string
  description: string
  wasteItems?: WasteItem[]
  createdAt: Date | string
}

interface RedeemedItem {
  id: string
  rewardKey: string
  points: number
  category: string
  redeemedAt: Date | string
}

interface DashboardContentProps {
  user: { email?: string | null; role?: string }
  pointsBalance: number
  kgRecycled?: number
  kgByMaterial?: Record<string, number>
  allTransactions?: TxItem[]
  redeemedRewards?: RedeemedItem[]
}

type SheetType = 'points' | 'kg' | 'rewards' | null

function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days === 1) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function txIcon(type: string) {
  if (type === 'recycle') return { bg: 'bg-emerald-500/15', color: 'text-emerald-500', Icon: Recycle }
  if (type === 'reward')  return { bg: 'bg-purple-500/15',  color: 'text-purple-500',  Icon: Gift }
  return                         { bg: 'bg-yellow-500/15',  color: 'text-yellow-500',  Icon: Star }
}

const MATERIAL_LABELS: Record<string, string> = {
  plastic: 'Пластик', paper: 'Бумага', glass: 'Стекло',
  metal: 'Металл', electronics: 'Электроника', organic: 'Органика',
}

export function DashboardContent({
  user,
  pointsBalance,
  kgRecycled = 0,
  kgByMaterial = {},
  allTransactions = [],
  redeemedRewards = [],
}: DashboardContentProps) {
  const { t } = useLanguage()
  const [openSheet, setOpenSheet] = useState<SheetType>(null)

  // Recent 5 for the main feed
  const recentTx = allTransactions.slice(0, 5)

  // Filtered lists for sheets
  const recycleTx = allTransactions.filter((tx) => tx.type === 'recycle')
  const earnedTx  = allTransactions.filter((tx) => tx.amount > 0)
  const totalSpent = redeemedRewards.reduce((s, r) => s + r.points, 0)

  const stats = [
    {
      key: 'points' as SheetType,
      labelKey: 'points-label',
      value: pointsBalance.toLocaleString('ru-RU'),
      icon: Star,
      color: 'from-yellow-400 to-orange-400',
      sub: `${earnedTx.length} начислений`,
    },
    {
      key: 'kg' as SheetType,
      labelKey: 'kg-recycled',
      value: kgRecycled > 0
        ? kgRecycled.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
        : recycleTx.length > 0 ? `${recycleTx.length} сдач` : '0',
      icon: Recycle,
      color: 'from-emerald-400 to-cyan-400',
      sub: `${recycleTx.length} посещений`,
    },
    {
      key: 'rewards' as SheetType,
      labelKey: 'rewards-count',
      value: String(redeemedRewards.length),
      icon: Trophy,
      color: 'from-purple-400 to-pink-400',
      sub: totalSpent > 0 ? `−${totalSpent.toLocaleString('ru-RU')} баллов` : 'нет наград',
    },
  ]

  const availableRewards = [
    { nameKey: 'reward-narodny', points: 250, categoryKey: 'cat-grocery' },
    { nameKey: 'reward-kulikov', points: 150, categoryKey: 'cat-cafe' },
    { nameKey: 'reward-yandex',  points: 250, categoryKey: 'cat-transport' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} variant="main" />

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8 md:pb-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{t('welcome')}</h1>
            <p className="text-muted-foreground">{t('track-progress')}</p>
          </div>
          <Link href="/dashboard/qr" className="text-sm text-cyan-500 hover:text-cyan-400">
            {t('qr-and-balance')}
          </Link>
        </div>

        {/* ── Stats cards (clickable) ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setOpenSheet(stat.key)}
              className="group rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-emerald-500/40 hover:shadow-md active:scale-[0.98]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-black" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-emerald-500 transition-colors">
                  <TrendingUp className="h-4 w-4" />
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{stat.sub}</p>
            </button>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent activity */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">{t('recent-activity')}</h2>
            <div className="space-y-1">
              {recentTx.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Активности пока нет</p>
              ) : (
                recentTx.map((tx) => {
                  const { bg, color, Icon } = txIcon(tx.type)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`ml-3 shrink-0 font-semibold tabular-nums ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
            {allTransactions.length > 5 && (
              <button
                type="button"
                onClick={() => setOpenSheet('points')}
                className="mt-4 w-full text-center text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Вся история →
              </button>
            )}
          </div>

          {/* Available rewards */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">{t('available-rewards')}</h2>
            <div className="space-y-3">
              {availableRewards.map((reward) => (
                <Link
                  key={reward.nameKey}
                  href="/dashboard/rewards"
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/30 p-4 text-left transition-colors hover:border-emerald-500/30"
                >
                  <div>
                    <p className="mb-1 font-medium text-foreground">{t(reward.nameKey)}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t(reward.categoryKey)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">{reward.points}</p>
                    <p className="text-xs text-muted-foreground">{t('points-word')}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/dashboard/rewards" className="mt-6 block">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-600 hover:to-cyan-600">
                <Gift className="mr-2 h-4 w-4" />
                {t('all-rewards')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Find dropoff */}
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
            <Link href="/dashboard/map">
              <Button className="bg-foreground font-semibold text-background hover:bg-foreground/90">
                {t('open-map')}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ════════════ SHEET: Баллы ════════════ */}
      <Sheet open={openSheet === 'points'} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400">
                <Star className="h-4 w-4 text-black" />
              </div>
              История баллов
            </SheetTitle>
            {/* Summary */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Текущий баланс</p>
                <p className="mt-0.5 text-xl font-bold text-emerald-500 tabular-nums">
                  {pointsBalance.toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Всего начислений</p>
                <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
                  {earnedTx.length}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {allTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Coins className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">Нет транзакций</p>
              </div>
            ) : (
              <div className="space-y-1">
                {allTransactions.map((tx) => {
                  const { bg, color, Icon } = txIcon(tx.type)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted/30"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground leading-tight">{tx.description}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatFullDate(tx.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <span className={`flex items-center gap-0.5 font-semibold tabular-nums text-sm ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                          {tx.amount >= 0
                            ? <ArrowUpRight className="h-3.5 w-3.5" />
                            : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {Math.abs(tx.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground/60">{t('points-word')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ════════════ SHEET: Сдано кг ════════════ */}
      <Sheet open={openSheet === 'kg'} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400">
                <Recycle className="h-4 w-4 text-black" />
              </div>
              История сдачи мусора
            </SheetTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Всего сдано</p>
                <p className="mt-0.5 text-xl font-bold text-emerald-500 tabular-nums">
                  {kgRecycled > 0
                    ? `${kgRecycled.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} кг`
                    : `${recycleTx.length} раз`}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Посещений</p>
                <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
                  {recycleTx.length}
                </p>
              </div>
            </div>
            {Object.keys(kgByMaterial).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(kgByMaterial).map(([mat, kg]) => (
                  <span
                    key={mat}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    {MATERIAL_LABELS[mat] ?? mat}: {kg.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} кг
                  </span>
                ))}
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {recycleTx.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Recycle className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">Сдач мусора пока нет</p>
                <p className="mt-1 text-sm text-muted-foreground/60">
                  Найдите ближайший пункт приёма на карте
                </p>
                <Link href="/dashboard/map" onClick={() => setOpenSheet(null)}>
                  <Button variant="outline" size="sm" className="mt-4 border-border">
                    <MapPin className="mr-2 h-3.5 w-3.5" />
                    Открыть карту
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recycleTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-muted/30"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                      <Recycle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground leading-tight">{tx.description}</p>
                      {tx.wasteItems && tx.wasteItems.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tx.wasteItems.map((item, i) => (
                            <span
                              key={i}
                              className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {MATERIAL_LABELS[item.material] ?? item.material} {item.kg} кг
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-xs text-emerald-500 font-medium">
                          <ArrowUpRight className="h-3 w-3" />
                          +{tx.amount} {t('points-word')}
                        </span>
                        <span className="text-xs text-muted-foreground/60">·</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatFullDate(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ════════════ SHEET: Награды ════════════ */}
      <Sheet open={openSheet === 'rewards'} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 border-border bg-card p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-400">
                <Trophy className="h-4 w-4 text-black" />
              </div>
              Полученные награды
            </SheetTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Получено наград</p>
                <p className="mt-0.5 text-xl font-bold text-purple-400 tabular-nums">
                  {redeemedRewards.length}
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Потрачено баллов</p>
                <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
                  {totalSpent.toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {redeemedRewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Trophy className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">{t('no-redeemed')}</p>
                <Link href="/dashboard/rewards" onClick={() => setOpenSheet(null)}>
                  <Button variant="outline" size="sm" className="mt-4 border-border">
                    <Gift className="mr-2 h-3.5 w-3.5" />
                    {t('catalog')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {redeemedRewards.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-muted/30"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15">
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground leading-tight">{t(r.rewardKey)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t(`cat-${r.category}`)}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-xs text-red-400 font-medium">
                          <ArrowDownRight className="h-3 w-3" />
                          −{r.points.toLocaleString('ru-RU')} {t('points-word')}
                        </span>
                        <span className="text-xs text-muted-foreground/60">·</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatFullDate(r.redeemedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
