import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">Ошибка авторизации</h1>
          <p className="text-gray-400 mb-8">
            Что-то пошло не так при авторизации. 
            Попробуйте ещё раз или обратитесь в поддержку.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button 
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold"
              >
                Попробовать снова
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline" 
                className="w-full border-white/10 text-white hover:bg-white/5"
              >
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
