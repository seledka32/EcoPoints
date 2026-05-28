'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Pencil, Check, X, Star, Recycle, Wind,
  QrCode, MapPin, Gift, LogOut, Lock, Leaf, Copy,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { RANKS, getRankProgress, type RankKey } from '@/lib/ranks'
import { toast } from 'sonner'

interface ProfileData {
  displayName: string
  rank: RankKey
  totalPoints: number
  team: string | null
}

interface ProfileContentProps {
  userId: string
  email: string
  pointsBalance: number
  kgRecycled: number
  co2Saved: number
  transactionCount: number
}

function getRankMeta(key: RankKey) {
  return RANKS.find((r) => r.key === key) ?? RANKS[RANKS.length - 1]
}

const RANKS_ASC = [...RANKS].reverse()

export function ProfileContent({
  userId: _userId,
  email,
  pointsBalance,
  kgRecycled,
  co2Saved,
  transactionCount,
}: ProfileContentProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setNameInput(data.displayName)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: nameInput.trim() }),
      })
      const data = (await res.json()) as { ok?: boolean; displayName?: string; error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Ошибка сохранения')
        return
      }
      setProfile((prev) => prev ? { ...prev, displayName: data.displayName ?? nameInput.trim() } : prev)
      setEditing(false)
      toast.success('Имя обновлено')
    } catch {
      toast.error('Ошибка сети')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ redirect: false })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader user={{ email }} variant="map" />
        <div className="flex justify-center py-20">
          <Spinner className="size-8 text-emerald-400" />
        </div>
      </div>
    )
  }

  const rankKey = profile?.rank ?? 'sprout'
  const totalPoints = profile?.totalPoints ?? pointsBalance
  const { current: currentRank, next: nextRank, progress } = getRankProgress(totalPoints)
  const rankMeta = getRankMeta(rankKey)
  const displayName = profile?.displayName ?? email.split('@')[0]

  const initials = displayName
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || displayName[0]?.toUpperCase() || '?'

  const achievements = [
    { key: 'first-step', emoji: '🌱', label: 'Первый шаг',     desc: 'Первая сдача',         unlocked: transactionCount > 0     },
    { key: 'recycler',   emoji: '♻️', label: 'Переработчик',   desc: '1 кг отходов',          unlocked: kgRecycled >= 1           },
    { key: 'collector',  emoji: '⭐', label: 'Коллекционер',   desc: '100 баллов',            unlocked: totalPoints >= 100        },
    { key: 'activist',   emoji: '🌿', label: 'Эко-активист',   desc: '10 кг отходов',         unlocked: kgRecycled >= 10          },
    { key: 'expert',     emoji: '💎', label: 'Эко-профи',      desc: '1000 баллов',           unlocked: totalPoints >= 1000       },
    { key: 'guardian',   emoji: '🌍', label: 'Хранитель',      desc: '100 кг отходов',        unlocked: kgRecycled >= 100         },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const treesEquivalent = Math.max(0, Math.round(kgRecycled / 5))
  const kmAvoided = Math.max(0, Math.round(co2Saved / 0.12))
  const currentRankIdx = RANKS_ASC.findIndex((r) => r.key === rankKey)
  const rankLineWidth = Math.min(100, (currentRankIdx / (RANKS_ASC.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ email }} variant="map" />

      <main className="mx-auto max-w-lg px-4 py-6 pb-28">

        {/* ── Hero card ── */}
        <div className="relative mb-4 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/60 via-background to-cyan-950/40">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/10 text-3xl font-bold shadow-xl ${rankMeta.bg} ${rankMeta.color}`}>
                {initials}
              </div>

              {/* Name + email + rank */}
              <div className="min-w-0 flex-1 pt-1">
                {editing ? (
                  <div className="mb-2 flex items-center gap-1.5">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={30}
                      className="h-8 flex-1 border-white/[0.12] bg-white/[0.06] text-sm text-foreground"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSave()
                        if (e.key === 'Escape') setEditing(false)
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="h-8 w-8 shrink-0 bg-emerald-500 p-0 text-black hover:bg-emerald-400"
                    >
                      {saving ? <Spinner className="size-3" /> : <Check className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditing(false); setNameInput(profile?.displayName ?? '') }}
                      className="h-8 w-8 shrink-0 p-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="group mb-1 flex items-center gap-1.5 text-left"
                  >
                    <span className="max-w-[180px] truncate text-xl font-bold text-foreground transition-colors group-hover:text-emerald-400">
                      {displayName}
                    </span>
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-emerald-400" />
                  </button>
                )}

                <p className="mb-2.5 truncate text-xs text-muted-foreground">{email}</p>

                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${rankMeta.bg} ${rankMeta.color}`}>
                  {rankMeta.emoji} {rankMeta.label}
                </span>
              </div>
            </div>

            {/* Balance strip */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Текущий баланс</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tabular-nums text-foreground">
                  {pointsBalance.toLocaleString('ru-RU')}
                </span>
                <span className="text-xs text-muted-foreground">баллов</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Rank progress ── */}
        <div className={`mb-4 rounded-2xl border border-white/[0.08] p-4 ${rankMeta.bg}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{rankMeta.emoji}</span>
              <div>
                <p className={`text-base font-bold ${rankMeta.color}`}>{rankMeta.label}</p>
                <p className="text-xs text-muted-foreground">{totalPoints.toLocaleString('ru-RU')} баллов всего</p>
              </div>
            </div>
            {nextRank ? (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">следующий</p>
                <p className="text-sm font-semibold text-foreground">{nextRank.emoji} {nextRank.label}</p>
                <p className="text-xs text-muted-foreground">
                  ещё {(nextRank.minPoints - totalPoints).toLocaleString('ru-RU')} баллов
                </p>
              </div>
            ) : (
              <span className="text-sm font-semibold text-emerald-400">🎉 Макс. ранг!</span>
            )}
          </div>
          {nextRank && (
            <>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{currentRank.label}</span>
                <span className="font-semibold text-foreground">{progress}%</span>
                <span>{nextRank.label}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { icon: Star,    color: 'text-yellow-400', bg: 'bg-yellow-500/15', value: pointsBalance.toLocaleString('ru-RU'), label: 'баллов' },
            { icon: Recycle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', value: kgRecycled > 0 ? `${kgRecycled}` : String(transactionCount), label: kgRecycled > 0 ? 'кг сдано' : 'сдач' },
            { icon: Wind,    color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   value: co2Saved > 0 ? String(co2Saved) : '—', label: 'кг CO₂' },
          ].map(({ icon: Icon, color, bg, value, label }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-3 text-center">
              <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Eco impact ── */}
        {(kgRecycled > 0 || co2Saved > 0) && (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              🌿 Ваш вклад в природу
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {treesEquivalent > 0 ? `~${treesEquivalent}` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">деревьев (экв.)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Wind className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {kmAvoided > 0 ? `~${kmAvoided}` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">км без авто</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Ranks journey ── */}
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          <p className="mb-4 text-sm font-semibold text-foreground">Путь эко-героя</p>
          <div className="relative flex items-center justify-between">
            {/* Base line */}
            <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" />
            {/* Progress line */}
            <div
              className="absolute left-5 top-5 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
              style={{ width: `calc(${rankLineWidth}% * ((100% - 40px) / 100%))` }}
            />
            {RANKS_ASC.map((rank, idx) => {
              const isUnlocked = totalPoints >= rank.minPoints
              const isCurrent = rank.key === rankKey
              return (
                <div key={rank.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                      isCurrent
                        ? `border-emerald-500 shadow-md shadow-emerald-500/30 ${rank.bg}`
                        : isUnlocked
                          ? `border-emerald-500/30 ${rank.bg}`
                          : 'border-border bg-card'
                    }`}
                  >
                    {isUnlocked ? (
                      rank.emoji
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium ${
                      isCurrent ? 'text-emerald-400' : isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/30'
                    }`}
                  >
                    {rank.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Достижения</p>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((a) => (
              <div
                key={a.key}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all ${
                  a.unlocked
                    ? 'border-emerald-500/25 bg-emerald-500/5'
                    : 'border-border bg-muted/20 opacity-40'
                }`}
              >
                <span className="text-2xl leading-none">{a.unlocked ? a.emoji : '🔒'}</span>
                <span className={`text-[10px] font-semibold leading-tight ${a.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {a.label}
                </span>
                <span className="text-[9px] leading-tight text-muted-foreground">{a.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Link
            href="/dashboard/qr"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 transition-colors group-hover:bg-emerald-500/25">
              <QrCode className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Мой QR</p>
              <p className="text-xs text-muted-foreground">Показать карту</p>
            </div>
          </Link>

          <Link
            href="/dashboard/qr"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 transition-colors group-hover:bg-cyan-500/25">
              <Copy className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Пригласить</p>
              <p className="text-xs text-muted-foreground">Реферальный код</p>
            </div>
          </Link>

          <Link
            href="/dashboard/map"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-blue-500/40 hover:bg-blue-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 transition-colors group-hover:bg-blue-500/25">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Карта</p>
              <p className="text-xs text-muted-foreground">Пункты приёма</p>
            </div>
          </Link>

          <Link
            href="/dashboard/rewards"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-purple-500/40 hover:bg-purple-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 transition-colors group-hover:bg-purple-500/25">
              <Gift className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Награды</p>
              <p className="text-xs text-muted-foreground">Каталог бонусов</p>
            </div>
          </Link>
        </div>

        {/* ── Sign out ── */}
        <Button
          variant="outline"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="w-full border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
        >
          {signingOut ? (
            <Spinner className="mr-2 size-4" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Выйти из аккаунта
        </Button>
      </main>
    </div>
  )
}
