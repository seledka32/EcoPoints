import Link from "next/link"
import { Leaf } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-background to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Leaf className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                EcoPoints
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Платформа, которая делает переработку отходов выгодной для всех.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Платформа</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#how-it-works" className="text-muted-foreground hover:text-emerald-400 transition-colors">Как это работает</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-emerald-400 transition-colors">Личный кабинет</Link></li>
              <li><Link href="/#partners" className="text-muted-foreground hover:text-emerald-400 transition-colors">Партнёры</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-emerald-400 transition-colors">Бонусы</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Аккаунт</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/auth/login" className="text-muted-foreground hover:text-emerald-400 transition-colors">Вход</Link></li>
              <li><Link href="/auth/sign-up" className="text-muted-foreground hover:text-emerald-400 transition-colors">Регистрация</Link></li>
              <li><Link href="/dashboard/qr" className="text-muted-foreground hover:text-emerald-400 transition-colors">QR-код</Link></li>
              <li><Link href="/#faq" className="text-muted-foreground hover:text-emerald-400 transition-colors">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Поддержка</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#faq" className="text-muted-foreground hover:text-emerald-400 transition-colors">FAQ</Link></li>
              <li><Link href="mailto:support@ecopoints.ru" className="text-muted-foreground hover:text-emerald-400 transition-colors">Написать нам</Link></li>
              <li><span className="text-muted-foreground/70">Политика — скоро</span></li>
              <li><span className="text-muted-foreground/70">Условия — скоро</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 EcoPoints. Все права защищены.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground/70">Соцсети — скоро</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
