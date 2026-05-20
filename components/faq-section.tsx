"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Как начисляются баллы?",
    answer: "Баллы начисляются в зависимости от типа и веса сданных отходов. Например, за килограмм пластика вы получите больше баллов, чем за бумагу. Все тарифы прозрачны и отображаются в приложении.",
  },
  {
    question: "Где можно сдать отходы?",
    answer: "Найти ближайшую точку сдачи можно на карте в приложении. Мы постоянно расширяем сеть партнёрских пунктов приёма, чтобы сделать переработку максимально удобной.",
  },
  {
    question: "На что можно потратить баллы?",
    answer: "Баллы можно обменять на скидки в магазинах, кафе, фитнес-клубах и других партнёрских организациях. Полный список предложений доступен в разделе «Бонусы» в личном кабинете.",
  },
  {
    question: "Как защищена система от мошенничества?",
    answer: "Мы используем QR-коды, геолокацию и автоматическое взвешивание для верификации сдачи. Также действуют лимиты на количество операций и ведётся полная история действий.",
  },
  {
    question: "Регистрация бесплатная?",
    answer: "Да, регистрация и использование платформы полностью бесплатны для пользователей. Вы не платите ничего — только зарабатываете баллы за сдачу отходов.",
  },
  {
    question: "Как стать партнёром платформы?",
    answer: "Для бизнеса мы предлагаем несколько моделей сотрудничества. Оставьте заявку через форму на сайте, и наш менеджер свяжется с вами для обсуждения условий.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-background to-background" />
      
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            Поддержка
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Частые вопросы
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Ответы на популярные вопросы о платформе
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
