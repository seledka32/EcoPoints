'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AlertCircle, ArrowLeft, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  OAuthSignin:        { title: 'Ошибка запуска OAuth', desc: 'Не удалось начать вход через Google. Убедитесь, что браузер разрешает редиректы.' },
  OAuthCallback:      { title: 'Ошибка ответа Google', desc: 'Google вернул ошибку при авторизации. Попробуйте ещё раз.' },
  OAuthCreateAccount: { title: 'Не удалось создать аккаунт', desc: 'Произошла ошибка при создании аккаунта через Google. Попробуйте зарегистрироваться по email.' },
  OAuthAccountNotLinked: { title: 'Email уже зарегистрирован', desc: 'Этот email уже зарегистрирован с паролем. Войдите через email или используйте другой Google-аккаунт.' },
  Callback:           { title: 'Ошибка обратного вызова', desc: 'Произошла ошибка при обработке ответа от Google.' },
  AccessDenied:       { title: 'Доступ запрещён', desc: 'Вы отказали в доступе. Нажмите кнопку "Разрешить" в окне Google для продолжения.' },
  Verification:       { title: 'Ссылка устарела', desc: 'Ссылка для подтверждения истекла или уже использована.' },
  Configuration:      { title: 'Ошибка конфигурации', desc: 'Google OAuth не настроен на сервере. Свяжитесь с администратором.' },
  Default:            { title: 'Ошибка авторизации', desc: 'Что-то пошло не так. Попробуйте ещё раз.' },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams?.get('error') ?? 'Default'
  const info = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад ко входу
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">EcoPoints</span>
          </div>

          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3 text-center">{info.title}</h1>
          <p className="text-gray-400 mb-2 text-center text-sm leading-relaxed">{info.desc}</p>

          {errorCode !== 'Default' && (
            <p className="text-center text-xs text-gray-600 mb-6">
              Код ошибки: <span className="font-mono text-gray-500">{errorCode}</span>
            </p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold">
                Попробовать снова
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                Зарегистрироваться по email
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
