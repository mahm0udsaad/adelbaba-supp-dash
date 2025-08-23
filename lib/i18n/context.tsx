"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Language, TranslationKeys } from "./types"
import { getTranslations } from "./index"

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationKeys
  isArabic: boolean
  formatMessage: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function I18nProvider({ children, defaultLanguage = "en" }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)

    // Update document direction and lang attribute
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = newLanguage
  }

  const t = getTranslations(language)
  const isArabic = language === "ar"

  const formatMessage = (key: keyof TranslationKeys, params?: Record<string, string | number>) => {
    let message = t[key]

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        message = message.replace(`{${paramKey}}`, String(value))
      })
    }

    return message
  }

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    isArabic,
    formatMessage,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

// Convenience hook for just getting translations
export function useTranslations(): TranslationKeys {
  const { t } = useI18n()
  return t
}

// Convenience hook for checking if Arabic
export function useIsArabic(): boolean {
  const { isArabic } = useI18n()
  return isArabic
}
