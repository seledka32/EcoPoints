'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Gift, ShoppingBag, Coffee, Zap, Globe, Dumbbell, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard-header'
import { useLanguage } from '@/hooks/use-language'

interface DashboardRewardsContentProps {
  user: { email?: string | null }
  pointsBalance: number
}

type CategoryKey = 'all' | 'grocery' | 'cafe' | 'online' | 'sport' | 'transport'

const categoryConfig: { key: CategoryKey; icon: React.ElementType }[] = [
  { key: 'all', icon: Tag },
  { key: 'grocery', icon: ShoppingBag },
  { key: 'cafe', icon: Coffee },
  { key: 'online', icon: Globe },
  { key: 'sport', icon: Dumbbell },
  { key: 'transport', icon: Zap },
]

const rewards: { nameKey: string; points: number; category: CategoryKey; descKey: string }[] = [
  { nameKey: 'reward-perekrestok', points: 300, category: 'grocery', descKey: 'reward-perekrestok-desc' },
  { nameKey: 'reward-starbucks', points: 200, category: 'cafe', descKey: 'reward-starbucks-desc' },
  { nameKey: 'reward-ozon', points: 500, category: 'online', descKey: 'reward-ozon-desc' },
  { nameKey: 'reward-kofemainia', points: 400, category: 'cafe', descKey: 'reward-kofemainia-desc' },
  { nameKey: 'reward-worldclass', points: 1200, category: 'sport', descKey: 'reward-worldclass-desc' },
  { nameKey: 'reward-vkusvill', points: 250, category: 'grocery', descKey: 'reward-vkusvill-desc' },
  { nameKey: 'reward-yandex', points: 350, category: 'transport', descKey: 'reward-yandex-desc' },
  { nameKey: 'reward-lamoda', points: 600, category: 'online', descKey: 'reward-lamoda-desc' },
  { nameKey: 'reward-fitnesshouse', points: 900, category: 'sport', descKey: 'reward-fitnesshouse-desc' },
  { nameKey: 'reward-magnit', points: 200, category: 'grocery', descKey: 'reward-magnit-desc' },
  { nameKey: 'reward-costa', points: 180, category: 'cafe', descKey: 'reward-costa-desc' },
  { nameKey: 'reward-scooter', points: 300, category: 'transport', descKey: 'reward-scooter-desc' },
]

export function DashboardRewardsContent({ user, pointsBalance }: DashboardRewardsContentProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const { t } = useLanguage()

  const filtered = activeCategory === 'all' ? rewards : rewards.filter((r) => r.category === activeCategory)

  const handleRedeem = (reward: (typeof rewards)[number]) => {
    if (pointsBalance < reward.points) {
      toast.error(t('not-enough-points'), {
        description: `${reward.points - pointsBalance} ${t('points-needed')}`,
      })
      return
    }
    toast.success(`«${t(reward.nameKey)}»`, {
      description: t('redeem-soon'),
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} variant="rewards" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{t('rewards-catalog')}</h1>
          <p className="text-muted-foreground">
            {t('your-balance')}:{' '}
            <span className="font-semibold text-emerald-500">{pointsBalance.toLocaleString('ru-RU')} баллов</span>
          </p>
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((reward, index) => {
            const canAfford = pointsBalance >= reward.points
            return (
              <div
                key={index}
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
                    {reward.points.toLocaleString('ru-RU')} баллов
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleRedeem(reward)}
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
      </main>
    </div>
  )
}
