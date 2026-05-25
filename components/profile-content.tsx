'use client'

import { useState, useEffect } from 'react'
import { Pencil, Check, X, Leaf, Users, Star, Recycle, Wind } from 'lucide-react'
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

export function ProfileContent({
  userId,
  email,
  pointsBalance,
  kgRecycled,
  co2Saved,
  transactionCount,
}: ProfileContentProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ email }} variant="map" />

      <main className="mx-auto max-w-lg px-4 py-8 pb-28">
        {/* Avatar + name */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/30 text-3xl font-bold text-emerald-300 shadow-lg shadow-emerald-500/10">
            {initials}
          </div>

          {editing ? (
            <div className="flex w-full max-w-xs items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={30}
                className="h-9 text-center bg-white/[0.04] border-white/[0.10] text-foreground"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSave(); if (e.key === 'Escape') setEditing(false) }}
              />
              <Button size="sm" onClick={() => void handleSave()} disabled={saving} className="h-9 bg-emerald-500 hover:bg-emerald-400 text-black px-3">
                {saving ? <Spinner className="size-3.5" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setNameInput(profile?.displayName ?? '') }} className="h-9 px-3">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="group flex items-center gap-2 text-lg font-bold text-foreground hover:text-emerald-400 transition-colors"
            >
              {displayName}
              <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
            </button>
          )}

          <p className="text-xs text-muted-foreground">{email}</p>
        </div>

        {/* Rank card */}
        <div className={`mb-4 rounded-2xl border border-white/[0.08] p-4 ${rankMeta.bg}`}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{rankMeta.emoji}</span>
              <div>
                <p className={`text-lg font-bold ${rankMeta.color}`}>{rankMeta.label}</p>
                <p className="text-xs text-muted-foreground">
                  {totalPoints.toLocaleString('ru-RU')} баллов
                </p>
              </div>
            </div>
            {nextRank && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">следующий</p>
                <p className="text-sm font-semibold text-foreground">{nextRank.emoji} {nextRank.label}</p>
                <p className="text-xs text-muted-foreground">
                  {(nextRank.minPoints - totalPoints).toLocaleString('ru-RU')} до цели
                </p>
              </div>
            )}
          </div>
          {nextRank && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{currentRank.label}</span>
                <span>{progress}%</span>
                <span>{nextRank.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {!nextRank && (
            <p className={`text-sm font-medium ${rankMeta.color}`}>🎉 Максимальный ранг достигнут!</p>
          )}
        </div>

        {/* Eco stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Star className="mx-auto mb-1 h-4 w-4 text-yellow-400" />
            <p className="text-lg font-bold text-foreground">{pointsBalance.toLocaleString('ru-RU')}</p>
            <p className="text-xs text-muted-foreground">баллов</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Recycle className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
            <p className="text-lg font-bold text-foreground">{kgRecycled > 0 ? `${kgRecycled} кг` : transactionCount}</p>
            <p className="text-xs text-muted-foreground">{kgRecycled > 0 ? 'переработано' : 'сдач'}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <Wind className="mx-auto mb-1 h-4 w-4 text-cyan-400" />
            <p className="text-lg font-bold text-foreground">{co2Saved > 0 ? `${co2Saved}` : '—'}</p>
            <p className="text-xs text-muted-foreground">кг CO₂</p>
          </div>
        </div>

        {/* Team (placeholder for 3b) */}
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15">
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Команды</p>
              <p className="text-xs text-muted-foreground">Скоро: создай или вступи в эко-команду</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
