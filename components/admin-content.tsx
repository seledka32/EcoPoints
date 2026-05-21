'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Search, Plus, User, Coins, Hash, Camera } from 'lucide-react'
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

export function AdminContent({ adminEmail }: AdminContentProps) {
  const [tab, setTab] = useState<SearchTab>('email')

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
  const [submitting, setSubmitting] = useState(false)
  const step2Ref = useRef<HTMLDivElement>(null)

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

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    const pts = parseInt(amount, 10)
    if (!pts || pts <= 0) {
      toast.error('Введите корректное количество баллов')
      return
    }
    if (!description.trim()) {
      toast.error('Введите описание')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/points/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selected.id,
          amount: pts,
          description: description.trim(),
          type: 'admin',
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка при начислении')
    } finally {
      setSubmitting(false)
    }
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
        <h1 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">Начисление баллов</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Step 1 */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1. Найти пользователя
            </h2>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setTab('email')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  tab === 'email'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                По email
              </button>
              <button
                type="button"
                onClick={() => setTab('code')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  tab === 'code'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                По коду / QR
              </button>
            </div>

            {/* Email search */}
            {tab === 'email' && (
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
            {tab === 'code' && (
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
                  <div className={`flex items-center gap-3 rounded-xl border p-3 border-emerald-500 bg-emerald-500/10`}>
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

          {/* Step 2: Add points form */}
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
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Описание
                  </label>
                  <Input
                    placeholder="Например: Сдача пластика 2 кг"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
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
      </main>
    </div>
  )
}
