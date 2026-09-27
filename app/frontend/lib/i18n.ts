import { router } from '@inertiajs/react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ptBR from '@/locales/pt-BR.json'

export const resources = {
  'pt-BR': { translation: ptBR },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  initAsync: false,
  interpolation: { escapeValue: false },
})

export function changeLocale(locale: string) {
  if (i18n.language !== locale) void i18n.changeLanguage(locale)
}

router.on('navigate', event => changeLocale(event.detail.page.props.locale))

export default i18n
