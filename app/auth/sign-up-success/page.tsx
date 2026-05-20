import Link from 'next/link'
import { Leaf, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-black" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">Аккаунт создан</h1>
          <p className="text-gray-400 mb-8">
            Вы успешно зарегистрировались. Теперь можно войти и начать копить баллы.
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300 text-left">
                Мы начислили 100 приветственных баллов!
              </p>
            </div>
          </div>

          <Link href="/auth/login">
            <Button 
              variant="outline" 
              className="w-full border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться ко входу
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
