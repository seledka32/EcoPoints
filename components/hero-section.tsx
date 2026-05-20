import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Recycle, Gift, MapPin, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-background to-cyan-950/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 lg:pt-40 lg:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Экология + Выгода = EcoPoints</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
            <span className="text-foreground">Превращаем отходы</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              в ценность
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
            Сдавайте мусор на переработку, копите баллы и получайте реальные скидки от партнёров. Забота об экологии теперь выгодна.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                Начать копить баллы
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 text-base border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50">
                Узнать больше
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-emerald-500/50 transition-all hover:bg-card/60">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Recycle className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">Точек сдачи</p>
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-cyan-500/50 transition-all hover:bg-card/60">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                  <Gift className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">100+</p>
                  <p className="text-sm text-muted-foreground">Партнёров</p>
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-emerald-500/50 transition-all hover:bg-card/60">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-foreground">10K+</p>
                  <p className="text-sm text-muted-foreground">Пользователей</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
