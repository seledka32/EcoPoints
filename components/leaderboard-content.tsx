'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Crown } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Spinner } from '@/components/ui/spinner'
import { RANKS, type RankKey } from '@/lib/ranks'

interface LeaderboardEntry {
  position: number
  userId: string
  displayName: string
  rank: RankKey
  points: number
  isCurrentUser: boolean
}

interface LeaderboardData {
  top20: LeaderboardEntry[]
  currentUser: { position: number; displayName: string; rank: RankKey; points: number } | null
}

type Period = 'alltime' | 'month' | 'week'

const PERIOD_LABELS: Record<Period, string> = {
  alltime: 'Всё время',
  month: 'Месяц',
  week: 'Неделя',
}

function getRankMeta(key: RankKey) {
  return RANKS.find((r) => r.key === key) ?? RANKS[RANKS.length - 1]
}

function RankBadge({ rankKey }: { rankKey: RankKey }) {
  const r = getRankMeta(rankKey)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${r.bg} ${r.color}`}>
      {r.emoji} {r.label}
    </span>
  )
}

function PositionIcon({ pos }: { pos: number }) {
  if (pos === 1) return <Crown className="h-4 w-4 text-yellow-400" />
  if (pos === 2) return <Medal className="h-4 w-4 text-gray-300" />
  if (pos === 3) return <Medal className="h-4 w-4 text-amber-600" />
  return <span className="w-4 text-center text-xs text-muted-foreground">{pos}</span>
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || name[0]?.toUpperCase() || '?'

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 text-sm font-bold text-emerald-300">
      {initials}
    </div>
  )
}

export function LeaderboardContent({ currentUserId }: { currentUserId: string }) {
  const [period, setPeriod] = useState<Period>('alltime')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`)
      if (res.ok) {
        const json = (await res.json()) as LeaderboardData
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData(period)
  }, [period, fetchData])

  const isCurrentUserInTop20 = data?.top20.some((e) => e.isCurrentUser) ?? false

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ email: '' }} variant="map" />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-28">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
            <Trophy className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Таблица лидеров</h1>
            <p className="text-xs text-muted-foreground">Топ эко-активистов EcoPoints</p>
          </div>
        </div>

        {/* Period tabs */}
        <div className="mb-5 flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all ${
                period === p
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="size-8 text-emerald-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {data?.top20.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                  entry.isCurrentUser
                    ? 'border-emerald-500/40 bg-emerald-500/5 shadow-sm shadow-emerald-500/10'
                    : 'border-border bg-card'
                }`}
              >
                {/* Position */}
                <div className="flex w-6 shrink-0 justify-center">
                  <PositionIcon pos={entry.position} />
                </div>

                {/* Avatar */}
                <Avatar name={entry.displayName} />

                {/* Name + rank */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-sm font-semibold ${entry.isCurrentUser ? 'text-emerald-400' : 'text-foreground'}`}>
                      {entry.displayName}
                      {entry.isCurrentUser && <span className="ml-1 text-xs font-normal text-emerald-500">(вы)</span>}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <RankBadge rankKey={entry.rank} />
                  </div>
                </div>

                {/* Points */}
                <div className="shrink-0 text-right">
                  <span className="text-sm font-bold text-foreground">
                    {entry.points.toLocaleString('ru-RU')}
                  </span>
                  <p className="text-xs text-muted-foreground">баллов</p>
                </div>
              </div>
            ))}

            {/* Current user outside top-20 */}
            {!isCurrentUserInTop20 && data?.currentUser && (
              <>
                <div className="my-3 flex items-center gap-2">
                  <div className="flex-1 border-t border-dashed border-border" />
                  <span className="text-xs text-muted-foreground">ваше место</span>
                  <div className="flex-1 border-t border-dashed border-border" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-3">
                  <div className="flex w-6 shrink-0 justify-center">
                    <span className="text-xs font-bold text-emerald-400">#{data.currentUser.position}</span>
                  </div>
                  <Avatar name={data.currentUser.displayName} />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-emerald-400">
                      {data.currentUser.displayName} <span className="text-xs font-normal text-emerald-500">(вы)</span>
                    </span>
                    <div className="mt-0.5">
                      <RankBadge rankKey={data.currentUser.rank} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-foreground">
                      {data.currentUser.points.toLocaleString('ru-RU')}
                    </span>
                    <p className="text-xs text-muted-foreground">баллов</p>
                  </div>
                </div>
              </>
            )}

            {data?.top20.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Trophy className="mx-auto mb-3 h-10 w-10 opacity-20" />
                <p className="text-sm">Пока нет данных за этот период</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
