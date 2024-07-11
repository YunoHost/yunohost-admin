import i18n from '@/i18n'
import store from '@/store'
import { nextTick } from 'vue'

import supportedLocales, {
  isSupportedLocale,
  type SupportedLocales,
} from '@/i18n/supportedLocales'

export let dateFnsLocale: any

/**
 * Returns the first two supported locales that can be found in the `localStorage` or
 * in the user browser settings.
 */
function getDefaultLocales() {
  const locale: SupportedLocales | null = store.getters.locale
  const fallbackLocale: SupportedLocales | null = store.getters.fallbackLocale
  if (locale && fallbackLocale) return [locale, fallbackLocale]

  const navigatorLocales = navigator.languages || [navigator.language]
  const defaultLocales: SupportedLocales[] = []

  for (const locale of navigatorLocales) {
    if (isSupportedLocale(locale) && !defaultLocales.includes(locale)) {
      defaultLocales.push(locale)
    } else {
      const lang = locale.split('-')[0]
      if (isSupportedLocale(lang) && !defaultLocales.includes(lang)) {
        defaultLocales.push(lang)
      }
    }
    if (defaultLocales.length === 2) break
  }

  return defaultLocales as [SupportedLocales, SupportedLocales]
}

export async function setI18nLocale(locale: SupportedLocales) {
  if (!i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale)
    // also query/set the date-fns locale object for time translation
    await loadDateFnsLocale(locale)
  }

  // Preload 'en' locales as it is the hard fallback
  if (locale !== 'en' && !i18n.global.availableLocales.includes('en')) {
    loadLocaleMessages('en')
  }

  if (i18n.mode === 'legacy') {
    // @ts-ignore
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }

  document.querySelector('html')!.setAttribute('lang', locale)
  // FIXME can't currently change document direction easily since bootstrap still doesn't handle rtl.
  // document.dir = locale === 'ar' ? 'rtl' : 'ltr'
}

export async function setI18nFallbackLocale(locale: SupportedLocales) {
  if (!i18n.global.availableLocales.includes(locale)) {
    await loadLocaleMessages(locale)
  }

  if (i18n.mode === 'legacy') {
    // @ts-ignore
    i18n.global.fallbackLocale = [locale, 'en']
  } else {
    i18n.global.fallbackLocale.value = [locale, 'en']
  }
}

/**
 * Loads a translation file and adds its content to the i18n plugin `messages`.
 *
 * @return {Promise<string>} Promise that resolve the given locale string
 */
export async function loadLocaleMessages(locale: SupportedLocales) {
  // load locale messages with dynamic import
  const messages = await import(`./locales/${locale}.json`)

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages)

  return nextTick()
}

/**
 * Loads a date-fns locale object
 */
async function loadDateFnsLocale(locale: SupportedLocales) {
  const dateFnsLocaleName = supportedLocales[locale].dateFnsLocale ?? locale
  dateFnsLocale = (
    await import(`../../node_modules/date-fns/locale/${dateFnsLocaleName}.mjs`)
  ).default
}

/**
 * Initialize all locales
 */
export async function initDefaultLocales() {
  // Get defined locales from `localStorage` or `navigator`
  const [locale, fallbackLocale] = getDefaultLocales()

  await store.dispatch('UPDATE_LOCALE', locale)
  await store.dispatch('UPDATE_FALLBACKLOCALE', fallbackLocale || 'en')
}
