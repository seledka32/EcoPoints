'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Leaf, ArrowLeft, Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
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
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleVerify = async (overrideCode?: string) => {
    const finalCode = overrideCode ?? code
    if (finalCode.length < 6) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code: finalCode }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Произошла ошибка')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login?verified=true')
      }, 1500)
    } catch {
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (val: string) => {
    setCode(val)
    setError(null)
    if (val.length === 6) {
      handleVerify(val)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Не удалось отправить письмо')
        return
      }

      setResendCooldown(60)
      setCode('')
      setError(null)
    } catch {
      setError('Не удалось отправить письмо')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Назад
        </Link>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EcoPoints</span>
            </div>

            {success ? (
              /* Success state */
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Email подтверждён!</h2>
                <p className="text-gray-400 text-sm text-center">Перенаправляем вас на страницу входа…</p>
                <div className="mt-4">
                  <Spinner className="size-5 text-emerald-400" />
                </div>
              </div>
            ) : (
              <>
                {/* Mail icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 text-center">Подтвердите email</h1>
                <p className="text-gray-500 text-sm text-center mb-1">
                  Мы отправили код на
                </p>
                <p className="text-emerald-400 font-medium text-center text-sm mb-7 break-all">
                  {email || 'ваш email'}
                </p>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* OTP */}
                <div className="flex justify-center mb-6">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-12 h-12 text-lg border-white/15 bg-white/[0.04] text-white data-[active=true]:border-emerald-500 data-[active=true]:ring-emerald-500/20 rounded-xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={() => handleVerify()}
                  disabled={code.length < 6 || isLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold h-11 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60 mb-6"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 size-4" />
                      Проверяем…
                    </>
                  ) : (
                    'Подтвердить'
                  )}
                </Button>

                <div className="text-center border-t border-white/[0.06] pt-5">
                  <p className="text-gray-600 text-sm mb-3">Не получили письмо?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-300'}`} />
                    )}
                    {resendCooldown > 0
                      ? `Повторная отправка через ${resendCooldown} сек`
                      : 'Отправить письмо повторно'}
                  </button>
                  <p className="text-gray-600 text-xs mt-2">Проверьте папку «Спам»</p>
                </div>
              </>
            )}
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
