import { UserPlus, QrCode, Coins, ShoppingBag } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Регистрация",
    description: "Создайте аккаунт за пару минут. Это бесплатно и займёт минимум времени.",
    color: "emerald",
    cardBorder: "hover:border-emerald-500/50",
  },
  {
    icon: QrCode,
    step: "02",
    title: "Сдайте отходы",
    description: "Найдите ближайшую точку сдачи, отсканируйте QR-код и сдайте отсортированный мусор.",
    color: "cyan",
    cardBorder: "hover:border-cyan-500/50",
  },
  {
    icon: Coins,
    step: "03",
    title: "Получите баллы",
    description: "Система автоматически начислит баллы в зависимости от типа и веса сданных отходов.",
    color: "emerald",
    cardBorder: "hover:border-emerald-500/50",
  },
  {
    icon: ShoppingBag,
    step: "04",
    title: "Обменяйте на бонусы",
    description: "Используйте накопленные баллы для получения скидок и предложений от партнёров.",
    color: "cyan",
    cardBorder: "hover:border-cyan-500/50",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-background to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            Простой процесс
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Как это работает
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            От регистрации до получения реальных бонусов — всего 4 простых шага
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={index} className="group relative">
              <div
                className={`relative h-full rounded-3xl border border-border/50 bg-card/40 p-8 backdrop-blur-sm transition-all duration-300 ${item.cardBorder}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${item.color}-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color === 'emerald' ? 'from-emerald-500/20 to-cyan-500/10' : 'from-cyan-500/20 to-emerald-500/10'} flex items-center justify-center`}>
                      <item.icon className={`w-8 h-8 ${item.color === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    </div>
                    <span className="text-6xl font-bold text-muted/30">{item.step}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
