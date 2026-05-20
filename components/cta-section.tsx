'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-cyan-700" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />

          <div className="relative p-10 sm:p-16 lg:p-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>{t('cta-badge')}</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-white text-balance">
                {t('cta-title')}
              </h2>

              <p className="mt-6 text-lg text-white/80 leading-relaxed text-pretty">
                {t('cta-desc')}
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="h-14 px-8 bg-white text-emerald-700 hover:bg-white/90 font-semibold shadow-xl">
                    {t('cta-btn1')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/#faq">
                  <Button variant="outline" size="lg" className="h-14 px-8 border-white/30 text-white hover:bg-white/10 bg-transparent">
                    {t('cta-btn2')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
