'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import {
  Search, Plus, User, Coins, Hash, Camera,
  Trash2, CheckCircle2, XCircle, Ticket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const QrScanner = dynamic(
  () => import('@/components/qr-scanner').then((m) => ({ default: m.QrScanner })),
  { ssr: false }
)

interface UserRow {
  id: string
  email: string
  role: string
  shortCode: string | null
  balance: number
}

interface AdminContentProps {
  adminEmail: string
}

type SearchTab = 'email' | 'code'
type AdminTab = 'points' | 'coupons'
type OperationType = 'recycle' | 'admin'

interface WasteRow {
  material: string
  kg: string
}

const WASTE_MATERIALS: { key: string; label: string; pts: number }[] = [
  { key: 'plastic',     label: 'Пластик',      pts: 20 },
  { key: 'paper',       label: 'Бумага',        pts: 15 },
  { key: 'glass',       label: 'Стекло',        pts: 10 },
  { key: 'metal',       label: 'Металл',        pts: 25 },
  { key: 'electronics', label: 'Электроника',   pts: 50 },
  { key: 'organic',     label: 'Органика',      pts: 5  },
]

function calcPoints(rows: WasteRow[]): number {
  return rows.reduce((sum, row) => {
    const mat = WASTE_MATERIALS.find((m) => m.key === row.material)
    const kg = parseFloat(row.kg) || 0
    return sum + (mat ? Math.round(mat.pts * kg) : 0)
  }, 0)
}

interface CouponInfo {
  rewardKey: string
  category: string
  points: number
  redeemedAt: string
  used: boolean
  usedAt: string | null
  userEmail: string | null
}

export function AdminContent({ adminEmail }: AdminContentProps) {
  const [adminTab, setAdminTab] = useState<AdminTab>('points')
  const [searchTab, setSearchTab] = useState<SearchTab>('email')
  const [opType, setOpType] = useState<OperationType>('recycle')

  // email search
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<UserRow[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  // code / QR
  const [codeInput, setCodeInput] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // selected user + form
  const [selected, setSelected] = useState<UserRow | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [wasteRows, setWasteRows] = useState<WasteRow[]>([{ material: 'plastic', kg: '' }])
  const [submitting, setSubmitting] = useState(false)
  const step2Ref = useRef<HTMLDivElement>(null)

  // coupon tab
  const [couponInput, setCouponInput] = useState('')
  const [couponScanner, setCouponScanner] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null)
  const [couponUsing, setCouponUsing] = useState(false)

  const selectUser = useCallback((u: UserRow) => {
    setSelected(u)
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [])

  const search = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error()
      const data = (await res.json()) as UserRow[]
      setUsers(data)
      setSearched(true)
    } catch {
      toast.error('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleEmailSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  const lookupByCode = useCallback(async (code: string) => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setCodeLoading(true)
    setShowScanner(false)
    try {
      const res = await fetch(`/api/admin/by-code?code=${encodeURIComponent(clean)}`)
      const data = (await res.json()) as UserRow & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')
      selectUser(data)
      toast.success('Пользователь найден', { description: data.email })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Пользователь не найден')
    } finally {
      setCodeLoading(false)
    }
  }, [selectUser])

  const handleCodeSearch = (e: React.FormEvent) => {
    e.preventDefault()
    lookupByCode(codeInput)
  }

  const handleScan = useCallback(
    (scanned: string) => {
      setShowScanner(false)
      lookupByCode(scanned)
    },
    [lookupByCode]
  )

  // Auto-sync amount when waste rows change (recycle mode)
  const autoPoints = calcPoints(wasteRows)

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    const pts = parseInt(amount, 10)
    if (!pts || pts <= 0) {
      toast.error('Введите корректное количество баллов')
      return
    }

    if (opType === 'recycle') {
      const validRows = wasteRows.filter((r) => r.material && parseFloat(r.kg) > 0)
      if (validRows.length === 0) {
        toast.error('Добавьте хотя бы один материал с весом')
        return
      }
    } else if (!description.trim()) {
      toast.error('Введите описание')
      return
    }

    setSubmitting(true)
    try {
      const validRows = opType === 'recycle'
        ? wasteRows
            .filter((r) => r.material && parseFloat(r.kg) > 0)
            .map((r) => ({ material: r.material, kg: parseFloat(r.kg) }))
        : undefined

      const res = await fetch('/api/points/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selected.id,
          amount: pts,
          description: opType === 'admin' ? description.trim() : undefined,
          type: opType,
          wasteItems: validRows,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')

      toast.success(`+${pts} баллов начислено`, { description: selected.email })

      setUsers((prev) =>
        prev.map((u) => (u.id === selected.id ? { ...u, balance: u.balance + pts } : u))
      )
      setSelected((prev) => (prev ? { ...prev, balance: prev.balance + pts } : null))
      setAmount('')
      setDescription('')
      setWasteRows([{ material: 'plastic', kg: '' }])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка при начислении')
    } finally {
      setSubmitting(false)
    }
  }

  const addWasteRow = () => {
    setWasteRows((prev) => [...prev, { material: 'plastic', kg: '' }])
  }

  const removeWasteRow = (idx: number) => {
    setWasteRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateWasteRow = (idx: number, field: keyof WasteRow, value: string) => {
    setWasteRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    )
  }

  // Coupon validation
  const lookupCoupon = useCallback(async (code: string) => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setCouponLoading(true)
    setCouponScanner(false)
    try {
      const res = await fetch(`/api/redeem/use?code=${encodeURIComponent(clean)}`)
      const data = (await res.json()) as CouponInfo & { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')
      setCouponInfo(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Купон не найден')
      setCouponInfo(null)
    } finally {
      setCouponLoading(false)
    }
  }, [])

  const handleCouponSearch = (e: React.FormEvent) => {
    e.preventDefault()
    lookupCoupon(couponInput)
  }

  const handleCouponScan = useCallback(
    (scanned: string) => {
      setCouponScanner(false)
      const code = scanned.trim().toUpperCase()
      setCouponInput(code)
      lookupCoupon(code)
    },
    [lookupCoupon]
  )

  const handleUseCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponUsing(true)
    try {
      const res = await fetch('/api/redeem/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: code }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; rewardKey?: string }
      if (!res.ok) throw new Error(data.error ?? 'Ошибка')
      toast.success('Купон использован', { description: data.rewardKey })
      setCouponInfo((prev) => (prev ? { ...prev, used: true, usedAt: new Date().toISOString() } : null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setCouponUsing(false)
    }
  }

  const REWARD_LABELS: Record<string, string> = {
    'reward-narodny':  'Народный −10%',
    'reward-beta':     'Beta Stores −10%',
    'reward-kulikov':  'Куликов выпечка',
    'reward-moka':     'Moka Coffee бесплатный кофе',
    'reward-alriano':  'Alriano −10%',
    'reward-giraffe':  'Жираф −15%',
    'reward-supara':   'Supara бесплатное блюдо',
    'reward-namba':    'Namba Taxi поездка',
    'reward-yandex':   'Яндекс Go поездка',
    'reward-megacom':  'МегаКом 50 сом',
    'reward-kgkg':     'Kg.kg −15%',
    'reward-levelup':  'Level Up 1 день',
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Coins className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-foreground">EcoPoints Admin</span>
          </div>
          <span className="text-sm text-muted-foreground">{adminEmail}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Admin top tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
          <button
            type="button"
            onClick={() => setAdminTab('points')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              adminTab === 'points'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Начисление баллов
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('coupons')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              adminTab === 'coupons'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Ticket className="h-3.5 w-3.5" />
            Проверить купон
          </button>
        </div>

        {/* ── POINTS TAB ── */}
        {adminTab === 'points' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Step 1 */}
            <div>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                1. Найти пользователя
              </h2>

              <div className="mb-4 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => setSearchTab('email')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    searchTab === 'email'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  По email
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTab('code')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    searchTab === 'code'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Hash className="h-3.5 w-3.5" />
                  По коду / QR
                </button>
              </div>

              {/* Email search */}
              {searchTab === 'email' && (
                <>
                  <form onSubmit={handleEmailSearch} className="mb-4 flex gap-2">
                    <Input
                      placeholder="Email пользователя..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  {loading && <p className="text-sm text-muted-foreground">Поиск...</p>}

                  {searched && !loading && users.length === 0 && (
                    <p className="text-sm text-muted-foreground">Пользователи не найдены</p>
                  )}

                  {users.length > 0 && (
                    <div className="space-y-2">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectUser(u)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            selected?.id === u.id
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border bg-card hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {u.role}
                              {u.shortCode ? ` · ${u.shortCode}` : ''}
                              {' · '}
                              {u.balance.toLocaleString('ru-RU')} баллов
                            </p>
                          </div>
                          {selected?.id === u.id && (
                            <span className="shrink-0 text-xs font-semibold text-emerald-500">
                              Выбран
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Code / QR search */}
              {searchTab === 'code' && (
                <div className="space-y-4">
                  <form onSubmit={handleCodeSearch} className="flex gap-2">
                    <Input
                      placeholder="Быстрый код (напр. A3K9P2)..."
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 font-mono tracking-widest"
                      maxLength={6}
                    />
                    <Button
                      type="submit"
                      disabled={codeLoading || codeInput.trim().length < 1}
                      className="bg-emerald-500 text-black hover:bg-emerald-400"
                    >
                      {codeLoading ? '...' : <Hash className="h-4 w-4" />}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-3 text-xs text-muted-foreground">или</span>
                    </div>
                  </div>

                  {showScanner ? (
                    <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
                      onClick={() => setShowScanner(true)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Сканировать QR-код
                    </Button>
                  )}

                  {selected && (
                    <div className="flex items-center gap-3 rounded-xl border p-3 border-emerald-500 bg-emerald-500/10">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{selected.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {selected.role}
                          {selected.shortCode ? ` · ${selected.shortCode}` : ''}
                          {' · '}
                          {selected.balance.toLocaleString('ru-RU')} баллов
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-emerald-500">Выбран</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div ref={step2Ref}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                2. Начислить баллы
              </h2>

              {!selected ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">Сначала выберите пользователя</p>
                </div>
              ) : (
                <form onSubmit={handleAddPoints} className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <p className="text-sm font-medium text-foreground">{selected.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Текущий баланс:{' '}
                      <span className="font-semibold text-emerald-500">
                        {selected.balance.toLocaleString('ru-RU')} баллов
                      </span>
                    </p>
                  </div>

                  {/* Operation type toggle */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Тип операции
                    </label>
                    <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                      <button
                        type="button"
                        onClick={() => setOpType('recycle')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          opType === 'recycle'
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Принять мусор
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpType('admin')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          opType === 'admin'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Другое начисление
                      </button>
                    </div>
                  </div>

                  {/* Recycle mode: waste items */}
                  {opType === 'recycle' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Материалы
                      </label>
                      <div className="space-y-2">
                        {wasteRows.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={row.material}
                              onChange={(e) => updateWasteRow(idx, 'material', e.target.value)}
                              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              {WASTE_MATERIALS.map((m) => (
                                <option key={m.key} value={m.key}>
                                  {m.label} ({m.pts} бал/кг)
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="кг"
                              value={row.kg}
                              onChange={(e) => updateWasteRow(idx, 'kg', e.target.value)}
                              className="w-24"
                            />
                            <span className="w-6 text-xs text-muted-foreground">кг</span>
                            {wasteRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWasteRow(idx)}
                                className="text-muted-foreground hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addWasteRow}
                        className="mt-2 flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Добавить материал
                      </button>
                      {autoPoints > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Авторасчёт: <span className="font-semibold text-emerald-500">{autoPoints} баллов</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Admin mode: description */}
                  {opType === 'admin' && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Описание
                      </label>
                      <Input
                        placeholder="Например: Бонус за активность"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Количество баллов
                    </label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Например: 150"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    {opType === 'recycle' && autoPoints > 0 && amount !== String(autoPoints) && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(autoPoints))}
                        className="mt-1 text-xs text-emerald-500 hover:text-emerald-400"
                      >
                        Применить авторасчёт ({autoPoints})
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-400 hover:to-cyan-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {submitting ? 'Начисляем...' : 'Начислить баллы'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── COUPONS TAB ── */}
        {adminTab === 'coupons' && (
          <div className="max-w-md">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Проверка и активация купонов
            </h2>

            <form onSubmit={handleCouponSearch} className="mb-4 flex gap-2">
              <Input
                placeholder="Код купона (8 символов)..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 font-mono tracking-widest"
                maxLength={8}
              />
              <Button
                type="submit"
                disabled={couponLoading || couponInput.trim().length < 1}
                className="bg-emerald-500 text-black hover:bg-emerald-400"
              >
                {couponLoading ? '...' : <Search className="h-4 w-4" />}
              </Button>
            </form>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs text-muted-foreground">или</span>
              </div>
            </div>

            {couponScanner ? (
              <div className="mb-4">
                <QrScanner onScan={handleCouponScan} onClose={() => setCouponScanner(false)} />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="mb-6 w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
                onClick={() => setCouponScanner(true)}
              >
                <Camera className="mr-2 h-4 w-4" />
                Сканировать QR купона
              </Button>
            )}

            {couponInfo && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {REWARD_LABELS[couponInfo.rewardKey] ?? couponInfo.rewardKey}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {couponInfo.userEmail ?? 'Пользователь не найден'}
                    </p>
                  </div>
                  {couponInfo.used ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                      <XCircle className="h-3.5 w-3.5" />
                      Использован
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Активен
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="text-muted-foreground/60">Стоимость</p>
                    <p className="font-medium text-foreground">{couponInfo.points} баллов</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground/60">Дата получения</p>
                    <p className="font-medium text-foreground">
                      {new Date(couponInfo.redeemedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  {couponInfo.used && couponInfo.usedAt && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground/60">Использован</p>
                      <p className="font-medium text-foreground">
                        {new Date(couponInfo.usedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {!couponInfo.used && (
                  <Button
                    onClick={handleUseCoupon}
                    disabled={couponUsing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-black hover:from-emerald-400 hover:to-cyan-400"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {couponUsing ? 'Обрабатываем...' : 'Отметить как использованный'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
