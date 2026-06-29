'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang, TranslationKey } from '@/lib/i18n'

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'es',
  setLang: () => {},
  t: (k) => k,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    const saved = localStorage.getItem('proservicio_lang') as Lang
    if (saved && (saved === 'es' || saved === 'en')) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('proservicio_lang', l)
  }

  const t = (key: TranslationKey): string => translations[lang][key] || key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
