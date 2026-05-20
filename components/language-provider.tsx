'use client'

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { Language, languages, getTranslation } from '@/lib/languages'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    const browserLang = navigator.language.split('-')[0] as Language
    const defaultLang: Language = saved || (browserLang in languages ? browserLang : 'ru')
    setLanguageState(defaultLang)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }, [])

  const t = useCallback((key: string): string => {
    return getTranslation(language, key)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
