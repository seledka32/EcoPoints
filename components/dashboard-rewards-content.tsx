'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Gift, ShoppingBag, Coffee, Zap, Globe, Dumbbell, Tag,
  CheckCircle2, Clock, Loader2, PackageOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DashboardHeader } from '@/components/dashboard-header'
import { useLanguage } from '@/hooks/use-language'
import { Spinner } from '@/components/ui/spinner'

interface DashboardRewardsContentProps {
  user: { email?: string | null }
  pointsBalance: number
}

type CategoryKey = 'all' | 'grocery' | 'cafe' | 'online' | 'sport' | 'transport'
type TabKey = 'catalog' | 'my-rewards'

interface RedeemedReward {
  id: string
  rewardKey: string
  points: number
  category: string
  redeemedAt: string
}

const categoryConfig: { key: CategoryKey; icon: React.ElementType }[] = [
  { key: 'all', icon: Tag },
  { key: 'grocery', icon: ShoppingBag },
  { key: 'cafe', icon: Coffee },
  { key: 'online', icon: Globe },
  { key: 'sport', icon: Dumbbell },
  { key: 'transport', icon: Zap },
]

const rewards: { nameKey: string; points: number; category: CategoryKey; descKey: string }[] = [
  { nameKey: 'reward-perekrestok',  points: 300,  category: 'grocery',   descKey: 'reward-perekrestok-desc' },
  { nameKey: 'reward-starbucks',    points: 200,  category: 'cafe',      descKey: 'reward-starbucks-desc' },
  { nameKey: 'reward-ozon',         points: 500,  category: 'online',    descKey: 'reward-ozon-desc' },
  { nameKey: 'reward-kofemainia',   points: 400,  category: 'cafe',      descKey: 'reward-kofemainia-desc' },
  { nameKey: 'reward-worldclass',   points: 1200, category: 'sport',     descKey: 'reward-worldclass-desc' },
  { nameKey: 'reward-vkusvill',     points: 250,  category: 'grocery',   descKey: 'reward-vkusvill-desc' },
  { nameKey: 'reward-yandex',       points: 350,  category: 'transport', descKey: 'reward-yandex-desc' },
  { nameKey: 'reward-lamoda',       points: 600,  category: 'online',    descKey: 'reward-lamoda-desc' },
  { nameKey: 'reward-fitnesshouse', points: 900,  category: 'sport',     descKey: 'reward-fitnesshouse-desc' },
  { nameKey: 'reward-magnit',       points: 200,  category: 'grocery',   descKey: 'reward-magnit-desc' },
  { nameKey: 'reward-costa',        points: 180,  category: 'cafe',      descKey: 'reward-costa-desc' },
  { nameKey: 'reward-scooter',      points: 300,  category: 'transport', descKey: 'reward-scooter-desc' },
]

function formatDate(dateStr: string, lang: string) {
  const localeMap: Record<string, string> = {
    ru: 'ru-RU', ky: 'ru-RU', en: 'en-US', ko: 'ko-KR',
    es: 'es-ES', fr: 'fr-FR', de: 'de-DE', ja: 'ja-JP',
  }
  return new Date(dateStr).toLocaleDateString(localeMap[lang] ?? 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function DashboardRewardsContent({ user, pointsBalance }: DashboardRewardsContentProps) {
  const { t, language } = useLanguage()

  const [balance, setBalance] = useState(pointsBalance)
  const [activeTab, setActiveTab] = useState<TabKey>('catalog')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [confirmReward, setConfirmReward] = useState<typeof rewards[number] | null>(null)
  const [redeeming, setRedeeming] = useState(false)

  // My rewards state
  const [myRewards, setMyRewards] = useState<RedeemedReward[] | null>(null)
  const [loadingMyRewards, setLoadingMyRewards] = useState(false)

  const loadMyRewards = useCallback(async () => {
    if (myRewards !== null) return
    setLoadingMyRewards(true)
    try {
      const res = await fetch('/api/my-rewards')
      const data = (await res.json()) as RedeemedReward[]
      setMyRewards(Array.isArray(data) ? data : [])
    } catch {
      setMyRewards([])
    } finally {
      setLoadingMyRewards(false)
    }
  }, [myRewards])

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    if (tab === 'my-rewards') loadMyRewards()
  }

  const handleConfirmRedeem = async () => {
    if (!confirmReward) return
    setRedeeming(true)

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rewardKey: confirmReward.nameKey }),
      })
      const data = (await res.json()) as { ok?: boolean; newBalance?: number; error?: string }

      if (!res.ok) {
        toast.error(data.error ?? 'Произошла ошибка')
        return
      }

      setBalance(data.newBalance ?? balance - confirmReward.points)
      setMyRewards(null) // Reset so it re-fetches on next open
      toast.success(t('get-reward'), {
        description: t(confirmReward.nameKey),
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      })
    } catch {
      toast.error('Произошла ошибка')
    } finally {
      setRedeeming(false)
      setConfirmReward(null)
    }
  }

  const filtered = activeCategory === 'all'
    ? rewards
    : rewards.filter((r) => r.category === activeCategory)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} variant="rewards" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">
            {t('rewards-catalog')}
          </h1>
          <p className="text-muted-foreground">
            {t('your-balance')}:{' '}
            <span className="font-semibold text-emerald-500">
              {balance.toLocaleString('ru-RU')} {t('points-word')}
            </span>
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
          {(['catalog', 'my-rewards'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'catalog' ? (
                <Gift className="h-3.5 w-3.5" />
              ) : (
                <PackageOpen className="h-3.5 w-3.5" />
              )}
              {t(tab)}
            </button>
          ))}
        </div>

        {/* ─── CATALOG TAB ─── */}
        {activeTab === 'catalog' && (
          <>
            {/* Category filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categoryConfig.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === key
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black'
                      : 'border border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`cat-${key}`)}
                </button>
              ))}
            </div>

            {/* Reward cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((reward) => {
                const canAfford = balance >= reward.points
                return (
                  <div
                    key={reward.nameKey}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-emerald-500/30"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10">
                        <Gift className="h-5 w-5 text-emerald-500" />
                      </div>
                      <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                        {t(`cat-${reward.category}`)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h3 className="mb-1 font-semibold text-foreground">{t(reward.nameKey)}</h3>
                      <p className="text-sm text-muted-foreground">{t(reward.descKey)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${canAfford ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {reward.points.toLocaleString('ru-RU')} {t('points-word')}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!canAfford) {
                            toast.error(t('not-enough-points'), {
                              description: `${reward.points - balance} ${t('points-needed')}`,
                            })
                            return
                          }
                          setConfirmReward(reward)
                        }}
                        className={
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-400 hover:to-cyan-400'
                            : 'border border-border bg-transparent text-muted-foreground hover:bg-muted/30'
                        }
                      >
                        {canAfford ? t('get-reward') : t('not-enough-points')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ─── MY REWARDS TAB ─── */}
        {activeTab === 'my-rewards' && (
          <>
            {loadingMyRewards && (
              <div className="flex items-center justify-center py-20">
                <Spinner className="size-8 text-emerald-500" />
              </div>
            )}

            {!loadingMyRewards && myRewards !== null && myRewards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/30">
                  <PackageOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">{t('no-redeemed')}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('catalog')} →
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab('catalog')}
                >
                  {t('catalog')}
                </Button>
              </div>
            )}

            {!loadingMyRewards && myRewards && myRewards.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myRewards.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500/20"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground leading-tight">{t(r.rewardKey)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t(`cat-${r.category}`)}</p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                          −{r.points.toLocaleString('ru-RU')} {t('spent')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(r.redeemedAt, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmReward} onOpenChange={(open) => !open && setConfirmReward(null)}>
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('get-reward')}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/10">
                    <Gift className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {confirmReward ? t(confirmReward.nameKey) : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {confirmReward ? t(confirmReward.descKey) : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('will-deduct')}{' '}
                  <span className="font-semibold text-red-400">
                    {confirmReward?.points.toLocaleString('ru-RU')} {t('points-word')}
                  </span>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmReward(null)}
              disabled={redeeming}
              className="border-border"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirmRedeem}
              disabled={redeeming}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-400 hover:to-cyan-400"
            >
              {redeeming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('confirm-btn')}…
                </>
              ) : (
                t('confirm-btn')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
