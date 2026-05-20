import { Wallet, TrendingUp, Shield, Globe, Users, BarChart3 } from "lucide-react"

const userBenefits = [
  {
    icon: Wallet,
    title: "Реальная выгода",
    description: "Получайте скидки и бонусы от сотен партнёров за простое действие — сдачу отходов на переработку.",
  },
  {
    icon: TrendingUp,
    title: "Личный прогресс",
    description: "Отслеживайте свой вклад в экологию: вес сданных отходов, заработанные баллы и сэкономленные ресурсы.",
  },
  {
    icon: Shield,
    title: "Прозрачная система",
    description: "Все операции фиксируются. Вы всегда знаете, сколько сдали, сколько заработали и куда потратили.",
  },
]

const businessBenefits = [
  {
    icon: Users,
    title: "Новые клиенты",
    description: "Получите доступ к аудитории экологически сознательных пользователей, готовых к покупкам.",
  },
  {
    icon: Globe,
    title: "ESG-имидж",
    description: "Укрепите репутацию социально ответственной компании и соответствуйте стандартам устойчивого развития.",
  },
  {
    icon: BarChart3,
    title: "Эффективный маркетинг",
    description: "Привлекайте клиентов дешевле, чем через традиционную рекламу, с высокой конверсией.",
  },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-cyan-500/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            Выгода для всех
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Преимущества платформы
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            EcoPoints создаёт ценность для пользователей, бизнеса и окружающей среды
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Users */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              Для пользователей
            </div>
            
            {userBenefits.map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex gap-5 p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-emerald-500/30 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Business */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
              Для бизнеса
            </div>
            
            {businessBenefits.map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex gap-5 p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-cyan-500/30 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
