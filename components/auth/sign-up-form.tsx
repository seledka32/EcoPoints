'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Leaf, ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { Spinner } from '@/components/ui/spinner'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
        body: JSON.stringify({ email, password }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? 'Произошла ошибка')
      }

      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!loginRes?.ok) {
        router.push('/auth/login')
        return
      }

      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/20 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
              <Leaf className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EcoPoints</span>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">Регистрация</h1>
          <p className="mb-8 text-gray-400">Создайте аккаунт и начните копить баллы</p>

          {refCode ? (
            <div className="mb-6 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              Регистрация по приглашению{' '}
              <span className="font-mono font-semibold text-white">{refCode}</span>
            </div>
          ) : null}

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.ru"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-gray-300">
                Повторите пароль
              </Label>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 py-6 font-semibold text-black hover:from-emerald-600 hover:to-cyan-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Регистрация…
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Уже есть аккаунт?{' '}
            <Link
              href="/auth/login"
              className="text-emerald-400 transition-colors hover:text-emerald-300"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
