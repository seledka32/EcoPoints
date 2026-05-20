'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Coffee, ShoppingCart, Dumbbell, Monitor, Film, Pill } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export function PartnersSection() {
  const { t } = useLanguage()

  const partnerCategories = [
    { name: t('par-cat-1'), icon: Coffee },
    { name: t('par-cat-2'), icon: ShoppingCart },
    { name: t('par-cat-3'), icon: Dumbbell },
    { name: t('par-cat-4'), icon: Monitor },
    { name: t('par-cat-5'), icon: Film },
    { name: t('par-cat-6'), icon: Pill },
  ]

  return (
    <section id="partners" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-background to-cyan-950/50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              {t('par-badge')}
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold text-balance">
              <span className="text-foreground">{t('par-h1')}</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {t('par-h2')}
              </span>
            </h2>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty">
              {t('par-desc')}
            </p>

            <div className="mt-10 space-y-4">
              {[t('par-feat1'), t('par-feat2'), t('par-feat3')].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="mt-10 h-14 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold shadow-xl shadow-emerald-500/25">
              <a href="mailto:partners@ecopoints.ru?subject=%D0%9F%D0%B0%D1%80%D1%82%D0%BD%D1%91%D1%80%D1%81%D1%82%D0%B2%D0%BE%20EcoPoints">
                {t('par-btn')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {partnerCategories.map((category, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-emerald-500/30 transition-all text-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 flex items-center justify-center">
                    <category.icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
