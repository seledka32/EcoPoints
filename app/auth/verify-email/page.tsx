'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Leaf, ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') ?? ''

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleVerify = async () => {
    if (code.length < 6) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Произошла ошибка')
        return
      }

      router.push('/auth/login?verified=true')
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Произошла ошибка')
        return
      }

      setResendSuccess(true)
      setResendCooldown(60)
      setCode('')
    } catch {
      setError('Не удалось отправить письмо')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EcoPoints</span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 text-center">Подтвердите email</h1>
          <p className="text-gray-400 mb-2 text-center text-sm">
            Мы отправили 6-значный код на
          </p>
          <p className="text-emerald-400 font-medium text-center text-sm mb-8 break-all">
            {email}
          </p>

          {resendSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-emerald-400 text-center">Новый код отправлен!</p>
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val)
                setError(null)
              }}
              onComplete={handleVerify}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-12 text-lg border-white/20 bg-white/5 text-white data-[active=true]:border-emerald-500 data-[active=true]:ring-emerald-500/20"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <Button
            onClick={handleVerify}
            disabled={code.length < 6 || isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold py-6 mb-4"
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Проверка…
              </>
            ) : (
              'Подтвердить'
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">Не пришло письмо?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <Spinner className="size-3.5" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {resendCooldown > 0
                ? `Отправить повторно через ${resendCooldown}с`
                : 'Отправить повторно'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Spinner className="size-8 text-emerald-400" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
