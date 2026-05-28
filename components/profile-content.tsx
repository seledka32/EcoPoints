'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Pencil, Check, X, Star, Recycle, Wind,
  QrCode, MapPin, Gift, LogOut, Lock, Leaf, Copy, Camera, Trash2,
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
  avatarUrl: string | null
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

/* ── Canvas resize: crop center square → 256×256 JPEG ── */
function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        const size = Math.min(img.width, img.height)
        const ox = (img.width - size) / 2
        const oy = (img.height - size) / 2
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, ox, oy, size, size, 0, 0, 256, 256)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function ProfileContent({
  userId: _userId,
  email,
  pointsBalance,
  kgRecycled,
  co2Saved,
  transactionCount,
}: ProfileContentProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile]       = useState<ProfileData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [nameInput, setNameInput]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setProfile(data)
        setNameInput(data.displayName)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: nameInput.trim() }),
      })
      const data = (await res.json()) as { ok?: boolean; displayName?: string; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Ошибка сохранения'); return }
      setProfile((p) => p ? { ...p, displayName: data.displayName ?? nameInput.trim() } : p)
      setEditing(false)
      toast.success('Имя обновлено')
    } catch { toast.error('Ошибка сети') }
    finally { setSaving(false) }
  }

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10 МБ.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение')
      return
    }

    setAvatarUploading(true)
    try {
      const base64 = await resizeToBase64(file)
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatarUrl: base64 }),
      })
      if (!res.ok) { toast.error('Ошибка загрузки'); return }
      setProfile((p) => p ? { ...p, avatarUrl: base64 } : p)
      toast.success('Аватар обновлён')
    } catch { toast.error('Не удалось обработать изображение') }
    finally { setAvatarUploading(false) }
  }

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatarUrl: null }),
      })
      if (!res.ok) { toast.error('Ошибка'); return }
      setProfile((p) => p ? { ...p, avatarUrl: null } : p)
      toast.success('Аватар удалён')
    } catch { toast.error('Ошибка сети') }
    finally { setAvatarUploading(false) }
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

  const rankKey     = profile?.rank ?? 'sprout'
  const totalPoints = profile?.totalPoints ?? pointsBalance
  const { current: currentRank, next: nextRank, progress } = getRankProgress(totalPoints)
  const rankMeta    = getRankMeta(rankKey)
  const displayName = profile?.displayName ?? email.split('@')[0]
  const avatarUrl   = profile?.avatarUrl ?? null

  const initials = displayName
    .split(/[\s_-]/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') ||
    displayName[0]?.toUpperCase() || '?'

  const achievements = [
    { key: 'first',     emoji: '🌱', label: 'Первый шаг',   desc: 'Первая сдача',         unlocked: transactionCount > 0     },
    { key: 'recycler',  emoji: '♻️', label: 'Переработчик', desc: '1 кг отходов',          unlocked: kgRecycled >= 1           },
    { key: 'collector', emoji: '⭐', label: 'Коллекционер', desc: '100 баллов',            unlocked: totalPoints >= 100        },
    { key: 'activist',  emoji: '🌿', label: 'Эко-активист', desc: '10 кг отходов',         unlocked: kgRecycled >= 10          },
    { key: 'expert',    emoji: '💎', label: 'Эко-профи',    desc: '1000 баллов',           unlocked: totalPoints >= 1000       },
    { key: 'guardian',  emoji: '🌍', label: 'Хранитель',    desc: '100 кг отходов',        unlocked: kgRecycled >= 100         },
  ]

  const unlockedCount    = achievements.filter((a) => a.unlocked).length
  const treesEquivalent  = Math.max(0, Math.round(kgRecycled / 5))
  const kmAvoided        = Math.max(0, Math.round(co2Saved / 0.12))
  const currentRankIdx   = RANKS_ASC.findIndex((r) => r.key === rankKey)
  const rankLineWidth    = Math.min(100, (currentRankIdx / (RANKS_ASC.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={{ email }} variant="map" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFile}
      />

      <main className="mx-auto max-w-lg px-4 py-6 pb-28">

        {/* ── Hero card ── */}
        <div className="relative mb-4 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/60 via-background to-cyan-950/40">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative p-6">
            <div className="flex items-start gap-4">

              {/* ── Avatar with upload overlay ── */}
              <div className="relative shrink-0">
                <div
                  className={`group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white/10 shadow-xl ${
                    avatarUrl ? '' : `${rankMeta.bg} ${rankMeta.color}`
                  } text-3xl font-bold`}
                  onClick={() => !avatarUploading && fileInputRef.current?.click()}
                  title="Изменить аватар"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    initials
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {avatarUploading ? (
                      <Spinner className="size-5 text-white" />
                    ) : (
                      <>
                        <Camera className="h-5 w-5 text-white" />
                        <span className="text-[9px] font-semibold text-white">Изменить</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove avatar button */}
                {avatarUrl && !avatarUploading && (
                  <button
                    onClick={handleRemoveAvatar}
                    title="Удалить аватар"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
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
                        if (e.key === 'Enter') void handleSaveName()
                        if (e.key === 'Escape') setEditing(false)
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => void handleSaveName()}
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
            { icon: Star,    color: 'text-yellow-400',  bg: 'bg-yellow-500/15',  value: pointsBalance.toLocaleString('ru-RU'),                                         label: 'баллов'                        },
            { icon: Recycle, color: 'text-emerald-400', bg: 'bg-emerald-500/15', value: kgRecycled > 0 ? `${kgRecycled}` : String(transactionCount),                   label: kgRecycled > 0 ? 'кг сдано' : 'сдач' },
            { icon: Wind,    color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    value: co2Saved > 0 ? String(co2Saved) : '—',                                          label: 'кг CO₂'                        },
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
                  <p className="text-lg font-bold text-foreground">{treesEquivalent > 0 ? `~${treesEquivalent}` : '—'}</p>
                  <p className="text-xs text-muted-foreground">деревьев (экв.)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                  <Wind className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{kmAvoided > 0 ? `~${kmAvoided}` : '—'}</p>
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
            <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" />
            <div
              className="absolute left-5 top-5 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
              style={{ width: `calc(${rankLineWidth}% * ((100% - 40px) / 100%))` }}
            />
            {RANKS_ASC.map((rank) => {
              const isUnlocked = totalPoints >= rank.minPoints
              const isCurrent  = rank.key === rankKey
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
                    {isUnlocked ? rank.emoji : <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />}
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
                  a.unlocked ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-border bg-muted/20 opacity-40'
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
          {[
            { href: '/dashboard/qr',      icon: QrCode, color: 'text-emerald-400', bg: 'bg-emerald-500/15', hoverBorder: 'hover:border-emerald-500/40', hoverBg: 'hover:bg-emerald-500/5', title: 'Мой QR',    sub: 'Показать карту'    },
            { href: '/dashboard/qr',      icon: Copy,   color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    hoverBorder: 'hover:border-cyan-500/40',    hoverBg: 'hover:bg-cyan-500/5',    title: 'Пригласить', sub: 'Реферальный код'  },
            { href: '/dashboard/map',     icon: MapPin, color: 'text-blue-400',    bg: 'bg-blue-500/15',    hoverBorder: 'hover:border-blue-500/40',    hoverBg: 'hover:bg-blue-500/5',    title: 'Карта',      sub: 'Пункты приёма'    },
            { href: '/dashboard/rewards', icon: Gift,   color: 'text-purple-400',  bg: 'bg-purple-500/15',  hoverBorder: 'hover:border-purple-500/40',  hoverBg: 'hover:bg-purple-500/5',  title: 'Награды',    sub: 'Каталог бонусов'  },
          ].map(({ href, icon: Icon, color, bg, hoverBorder, hoverBg, title, sub }) => (
            <Link
              key={`${href}-${title}`}
              href={href}
              className={`group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all ${hoverBorder} ${hoverBg}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} transition-opacity group-hover:opacity-80`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Sign out ── */}
        <Button
          variant="outline"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          className="w-full border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
        >
          {signingOut ? <Spinner className="mr-2 size-4" /> : <LogOut className="mr-2 h-4 w-4" />}
          Выйти из аккаунта
        </Button>
      </main>
    </div>
  )
}
