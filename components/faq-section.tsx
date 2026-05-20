"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useLanguage } from "@/hooks/use-language"

export function FAQSection() {
  const { t } = useLanguage()

  const faqs = [
    {
      question: t('faq-q1'),
      answer: t('faq-a1'),
    },
    {
      question: t('faq-q2'),
      answer: t('faq-a2'),
    },
    {
      question: t('faq-q3'),
      answer: t('faq-a3'),
    },
    {
      question: t('faq-q4'),
      answer: t('faq-a4'),
    },
    {
      question: t('faq-q5'),
      answer: t('faq-a5'),
    },
    {
      question: t('faq-q6'),
      answer: t('faq-a6'),
    },
  ]

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-background to-background" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            {t('faq-badge')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            {t('faq-title')}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {t('faq-desc')}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-card/60 transition-all"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6 [&>svg]:text-emerald-400">
                <span className="font-medium text-foreground group-hover:text-emerald-400 transition-colors">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
