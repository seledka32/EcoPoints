'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Leaf, ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'

import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!res?.ok) {
        setError('Неверный email или пароль')
        return
      }

      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EcoPoints</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Вход в аккаунт</h1>
          <p className="text-gray-400 mb-8">Введите данные для входа</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.ru"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Пароль</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Вход…
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            Нет аккаунта?{' '}
            <Link href="/auth/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
