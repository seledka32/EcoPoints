'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Leaf, ArrowLeft, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Spinner } from '@/components/ui/spinner'

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Минимум 6 символов', ok: password.length >= 6 },
    { label: 'Есть буква', ok: /[a-zA-Zа-яА-Я]/.test(password) },
    { label: 'Есть цифра', ok: /\d/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.ok ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
            {c.ok && <Check className="w-2 h-2 text-emerald-400" />}
          </div>
          <span className={`text-xs ${c.ok ? 'text-emerald-400' : 'text-gray-600'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeat, setShowRepeat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams?.get('ref')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (displayName.trim().length > 0 && displayName.trim().length < 2) {
      setError('Никнейм должен содержать минимум 2 символа')
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError('Пароли не совпадают')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? 'Произошла ошибка')
      }

      router.push('/auth/login?registered=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setError('Не удалось подключиться к Google. Попробуйте позже.')
      setGoogleLoading(false)
    }
  }

  const passwordsMatch = repeatPassword.length > 0 && password === repeatPassword

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          На главную
        </Link>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EcoPoints</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">Создать аккаунт</h1>
            <p className="text-gray-500 text-sm mb-7">Начните зарабатывать баллы за переработку</p>

            {/* Referral badge */}
            {refCode && (
              <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                Приглашение от:{' '}
                <span className="font-mono font-semibold text-white">{refCode}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Google button */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || isLoading}
              className="w-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.12] text-white font-medium h-11 rounded-xl transition-all mb-5 disabled:opacity-50"
            >
              {googleLoading ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <span className="mr-2"><GoogleIcon /></span>
              )}
              Продолжить с Google
            </Button>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-3 text-xs text-gray-600">или создайте аккаунт</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="display-name" className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Никнейм
                </Label>
                <Input
                  id="display-name"
                  type="text"
                  placeholder="Как вас называть?"
                  autoComplete="nickname"
                  maxLength={30}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-gray-600 focus:border-emerald-500/60 focus:ring-0 focus:bg-white/[0.06] h-11 rounded-xl transition-all"
                />
                {displayName.length > 0 && displayName.trim().length < 2 && (
                  <p className="text-xs text-red-400">Минимум 2 символа</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-gray-600 focus:border-emerald-500/60 focus:ring-0 focus:bg-white/[0.06] h-11 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-gray-600 focus:border-emerald-500/60 focus:ring-0 focus:bg-white/[0.06] h-11 rounded-xl pr-11 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="repeat-password" className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Повторите пароль
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeat ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className={`bg-white/[0.04] border-white/[0.10] text-white placeholder:text-gray-600 focus:ring-0 focus:bg-white/[0.06] h-11 rounded-xl pr-11 transition-all ${
                      repeatPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-500/50 focus:border-emerald-500/60'
                          : 'border-red-500/40 focus:border-red-500/50'
                        : 'focus:border-emerald-500/60'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeat(!showRepeat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showRepeat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {repeatPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-400">Пароли не совпадают</p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Пароли совпадают
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold h-11 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Создаём аккаунт…
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-gray-500 text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-gray-600 text-xs">
          Регистрируясь, вы соглашаетесь с условиями использования сервиса
        </p>
      </div>
    </div>
  )
}
