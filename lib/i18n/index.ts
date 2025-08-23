import type { Language, TranslationKeys } from "./types"
import { en } from "./translations/en"
import { ar } from "./translations/ar"

const translations = {
  en,
  ar,
}

export function getTranslations(language: Language): TranslationKeys {
  return translations[language] || translations.en
}

export function formatMessage(
  key: keyof TranslationKeys,
  language: Language,
  params?: Record<string, string | number>,
): string {
  const translations = getTranslations(language)
  let message = translations[key]

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      message = message.replace(`{${paramKey}}`, String(value))
    })
  }

  return message
}

export type { Language, TranslationKeys }
