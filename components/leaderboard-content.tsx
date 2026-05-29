'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Crown, Star, Recycle, Wind } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Spinner } from '@/components/ui/spinner'
import { RANKS, type RankKey } from '@/lib/ranks'
import { useLanguage } from '@/hooks/use-language'

interface LeaderboardEntry {
  position: number
  userId: string
  displayName: string
  rank: RankKey
  points: number
  isCurrentUser: boolean
  avatarUrl: string | null
}

interface LeaderboardData {
  top20: LeaderboardEntry[]
  currentUser: { position: number; displayName: string; rank: RankKey; points: number; avatarUrl: string | null } | null
}

interface LeaderboardContentProps {
  currentUserId: string
  pointsBalance: number
  kgRecycled: number
  transactionCount: number
  totalEarned: number
}

type Tab    = 'leaderboard' | 'achievements'
type Period = 'alltime' | 'month' | 'week'

const PERIOD_KEYS: { key: Period; tKey: string; icon: string }[] = [
  { key: 'alltime', tKey: 'period-alltime', icon: '🏆' },
  { key: 'month',   tKey: 'period-month',   icon: '📅' },
  { key: 'week',    tKey: 'period-week',    icon: '⚡' },
]

function getRankMeta(key: RankKey) {
  return RANKS.find((r) => r.key === key) ?? RANKS[RANKS.length - 1]
}

function RankBadge({ rankKey }: { rankKey: RankKey }) {
  const r = getRankMeta(rankKey)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${r.bg} ${r.color}`}>
      {r.emoji} {r.label}
    </span>
  )
}

function Avatar({
  name,
  avatarUrl,
  size = 'md',
  rankKey,
}: {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  rankKey?: RankKey
}) {
  const initials =
    name.split(/[\s_-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') ||
    name[0]?.toUpperCase() || '?'
  const r = rankKey ? getRankMeta(rankKey) : null
  const px = size === 'lg' ? 64 : size === 'md' ? 44 : 36
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'

  if (avatarUrl) {
    return (
      <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full border-2 border-white/10`}>
        <Image
          src={avatarUrl}
          alt={name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${
        r ? `${r.bg} ${r.color}` : 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 text-emerald-300'
      }`}
    >
      {initials}
    </div>
  )
}

/* ── Podium card for top 3 ── */
function PodiumCard({
  entry,
  place,
  isCurrentUser,
  t,
}: {
  entry: LeaderboardEntry
  place: 1 | 2 | 3
  isCurrentUser: boolean
  t: (k: string) => string
}) {
  const configs = {
    1: { icon: Crown,  iconColor: 'text-yellow-400', border: 'border-yellow-400/40', glow: 'shadow-yellow-500/20', badge: '👑', mt: 'mt-0',   avatarSize: 'lg' as const },
    2: { icon: Medal,  iconColor: 'text-slate-300',  border: 'border-slate-300/30',  glow: 'shadow-slate-400/10', badge: '🥈', mt: 'mt-6',   avatarSize: 'md' as const },
    3: { icon: Medal,  iconColor: 'text-amber-600',  border: 'border-amber-600/30',  glow: 'shadow-amber-600/10', badge: '🥉', mt: 'mt-10',  avatarSize: 'md' as const },
  }
  const cfg = configs[place]
  const Icon = cfg.icon

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border p-3 ${cfg.mt} transition-all ${
        isCurrentUser ? 'border-emerald-500/50 bg-emerald-500/5' : `${cfg.border} bg-card`
      } shadow-md ${cfg.glow}`}
    >
      <span className="text-xl">{cfg.badge}</span>
      <Avatar name={entry.displayName} avatarUrl={entry.avatarUrl} size={cfg.avatarSize} rankKey={entry.rank} />
      <div className="w-full text-center">
        <p className={`truncate text-xs font-semibold ${isCurrentUser ? 'text-emerald-400' : 'text-foreground'}`}>
          {entry.displayName}
          {isCurrentUser && <span className="ml-1 text-emerald-500">{t('you-suffix')}</span>}
        </p>
        <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
          {entry.points.toLocaleString()}
        </p>
        <p className="text-[9px] text-muted-foreground">{t('pts-sub')}</p>
      </div>
      <RankBadge rankKey={entry.rank} />
    </div>
  )
}

/* ── Achievements tab ── */
const ACHIEVEMENTS = [
  { key: 'first',     emoji: '🌱', labelKey: 'ach-first-label',     descKey: 'ach-first-desc',     check: (p: AchProps) => p.transactionCount > 0 },
  { key: 'recycler',  emoji: '♻️', labelKey: 'ach-recycler-label',  descKey: 'ach-recycler-desc',  check: (p: AchProps) => p.kgRecycled >= 1      },
  { key: 'collector', emoji: '⭐', labelKey: 'ach-collector-label', descKey: 'ach-collector-desc', check: (p: AchProps) => p.totalEarned >= 100   },
  { key: 'activist',  emoji: '🌿', labelKey: 'ach-activist-label',  descKey: 'ach-activist-desc',  check: (p: AchProps) => p.kgRecycled >= 10     },
  { key: 'expert',    emoji: '💎', labelKey: 'ach-expert-label',    descKey: 'ach-expert-desc',    check: (p: AchProps) => p.totalEarned >= 1000  },
  { key: 'guardian',  emoji: '🌍', labelKey: 'ach-guardian-label',  descKey: 'ach-guardian-desc',  check: (p: AchProps) => p.kgRecycled >= 100    },
]

interface AchProps { transactionCount: number; kgRecycled: number; totalEarned: number }

function AchievementsTab(props: AchProps & { t: (k: string) => string }) {
  const { t } = props
  const items = ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(props) }))
  const unlocked = items.filter((a) => a.unlocked).length
  const pct = Math.round((unlocked / items.length) * 100)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{t('my-achievements')}</p>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            {unlocked} / {items.length}
          </span>
        </div>
        <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-muted/40 p-2">
            <Star className="mx-auto mb-0.5 h-3.5 w-3.5 text-yellow-400" />
            <p className="text-sm font-bold tabular-nums text-foreground">{props.totalEarned.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{t('pts-sub')}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-2">
            <Recycle className="mx-auto mb-0.5 h-3.5 w-3.5 text-emerald-400" />
            <p className="text-sm font-bold tabular-nums text-foreground">{props.kgRecycled > 0 ? `${props.kgRecycled}` : props.transactionCount}</p>
            <p className="text-[10px] text-muted-foreground">{props.kgRecycled > 0 ? t('kg-recycled-sub') : t('submissions-sub')}</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-2">
            <Wind className="mx-auto mb-0.5 h-3.5 w-3.5 text-cyan-400" />
            <p className="text-sm font-bold tabular-nums text-foreground">
              {props.kgRecycled > 0 ? `~${Math.round(props.kgRecycled * 2.5)}` : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">{t('co2-sub')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((a) => (
          <div
            key={a.key}
            className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
              a.unlocked ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-border bg-card opacity-45'
            }`}
          >
            <span className="text-2xl leading-none">{a.unlocked ? a.emoji : '🔒'}</span>
            <div className="min-w-0">
              <p className={`text-sm font-semibold leading-tight ${a.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t(a.labelKey)}
              </p>
              <p className="text-xs text-muted-foreground">{t(a.descKey)}</p>
              {a.unlocked && (
                <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                  {t('ach-unlocked')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════ Main component ════════════════ */
export function LeaderboardContent({
  currentUserId,
  pointsBalance,
  kgRecycled,
  transactionCount,
  totalEarned,
}: LeaderboardContentProps) {
  const { t } = useLanguage()
  const [tab, setTab]       = useState<Tab>('leaderboard')
  const [period, setPeriod] = useState<Period>('alltime')
  const [data, setData]     = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`)
      if (res.ok) setData((await res.json()) as LeaderboardData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData(period) }, [period, fetchData])

  const myEntry       = data?.top20.find((e) => e.isCurrentUser)
  const myPosition    = myEntry?.position ?? data?.currentUser?.position
  const myPoints      = myEntry?.points ?? data?.currentUser?.points ?? pointsBalance
  const isInTop20     = !!myEntry
  const maxPoints     = data?.top20[0]?.points ?? 1
  const hasTop3       = (data?.top20.length ?? 0) >= 3
  const listFrom4     = data?.top20.filter((e) => e.position >= 4) ?? []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ email: '' }} variant="map" />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-28">

        {/* ── Hero ── */}
        <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-yellow-950/40 via-background to-orange-950/30 p-5">
          <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/30 to-orange-400/30">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('leaderboard-title')}</h1>
                <p className="text-xs text-muted-foreground">{t('leaderboard-sub')}</p>
              </div>
            </div>
            {myPosition && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('your-place')}</p>
                <p className="text-2xl font-bold text-emerald-400">#{myPosition}</p>
                <p className="text-[10px] text-muted-foreground">{myPoints.toLocaleString()} {t('pts-sub')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div className="mb-5 flex gap-2 rounded-2xl border border-border bg-card p-1">
          {([
            { key: 'leaderboard', tKey: 'tab-top',          tabVal: 'leaderboard' as Tab },
            { key: 'achievements', tKey: 'tab-achievements', tabVal: 'achievements' as Tab },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.tabVal)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                tab === item.tabVal
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(item.tKey)}
            </button>
          ))}
        </div>

        {tab === 'achievements' ? (
          <AchievementsTab
            transactionCount={transactionCount}
            kgRecycled={kgRecycled}
            totalEarned={totalEarned}
            t={t}
          />
        ) : (
          <>
            {/* ── Period tabs ── */}
            <div className="mb-5 flex gap-2">
              {PERIOD_KEYS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    period === p.key
                      ? 'bg-foreground text-background shadow-sm'
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{p.icon}</span>
                  {t(p.tKey)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner className="size-8 text-emerald-400" />
              </div>
            ) : (
              <div className="space-y-3">

                {/* ── Top 3 podium ── */}
                {hasTop3 && (
                  <div className="mb-2 flex items-end gap-2">
                    <PodiumCard entry={data!.top20[1]} place={2} isCurrentUser={data!.top20[1].isCurrentUser} t={t} />
                    <PodiumCard entry={data!.top20[0]} place={1} isCurrentUser={data!.top20[0].isCurrentUser} t={t} />
                    <PodiumCard entry={data!.top20[2]} place={3} isCurrentUser={data!.top20[2].isCurrentUser} t={t} />
                  </div>
                )}

                {/* ── List 4-20 ── */}
                {listFrom4.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    {listFrom4.map((entry, idx) => {
                      const barW = Math.max(4, Math.round((entry.points / maxPoints) * 100))
                      return (
                        <div
                          key={entry.userId}
                          className={`relative flex items-center gap-3 px-4 py-3 transition-colors ${
                            idx !== listFrom4.length - 1 ? 'border-b border-border' : ''
                          } ${entry.isCurrentUser ? 'bg-emerald-500/5' : 'hover:bg-muted/30'}`}
                        >
                          {/* Subtle progress bar bg */}
                          <div
                            className="pointer-events-none absolute left-0 top-0 h-full rounded-l-none bg-emerald-500/[0.04] transition-all"
                            style={{ width: `${barW}%` }}
                          />

                          {/* Position */}
                          <div className="relative flex w-7 shrink-0 justify-center">
                            {entry.position <= 9 ? (
                              <span className={`text-sm font-bold ${entry.isCurrentUser ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                {entry.position}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-muted-foreground">{entry.position}</span>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar name={entry.displayName} avatarUrl={entry.avatarUrl} size="sm" rankKey={entry.rank} />

                          {/* Name + rank */}
                          <div className="relative min-w-0 flex-1">
                            <p className={`truncate text-sm font-semibold ${entry.isCurrentUser ? 'text-emerald-400' : 'text-foreground'}`}>
                              {entry.displayName}
                              {entry.isCurrentUser && <span className="ml-1 text-xs font-normal text-emerald-500">{t('you-suffix')}</span>}
                            </p>
                            <RankBadge rankKey={entry.rank} />
                          </div>

                          {/* Points */}
                          <div className="relative shrink-0 text-right">
                            <span className="text-sm font-bold tabular-nums text-foreground">
                              {entry.points.toLocaleString()}
                            </span>
                            <p className="text-[10px] text-muted-foreground">{t('pts-sub')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ── Current user outside top-20 ── */}
                {!isInTop20 && data?.currentUser && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-dashed border-border" />
                      <span className="text-xs text-muted-foreground">{t('your-place')}</span>
                      <div className="flex-1 border-t border-dashed border-border" />
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3">
                      <div className="flex w-7 shrink-0 justify-center">
                        <span className="text-sm font-bold text-emerald-400">#{data.currentUser.position}</span>
                      </div>
                      <Avatar name={data.currentUser.displayName} avatarUrl={data.currentUser.avatarUrl} size="sm" rankKey={data.currentUser.rank} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-emerald-400">
                          {data.currentUser.displayName}
                          <span className="ml-1 text-xs font-normal text-emerald-500">{t('you-suffix')}</span>
                        </p>
                        <RankBadge rankKey={data.currentUser.rank} />
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {data.currentUser.points.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{t('pts-sub')}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Empty state ── */}
                {(data?.top20.length ?? 0) === 0 && (
                  <div className="rounded-2xl border border-border bg-card py-16 text-center">
                    <Trophy className="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
                    <p className="text-sm text-muted-foreground">{t('no-period-data')}</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">{t('recycle-to-rank')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
