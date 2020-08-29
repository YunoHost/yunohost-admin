import i18n from '@/i18n'
import store from '@/store'
import supportedLocales from './supportedLocales'

let dateFnsLocale
const loadedLanguages = []

/**
 * Returns the first two supported locales that can be found in the `localStorage` or
 * in the user browser settings.
 *
 * @return {string[]}
 */
function getDefaultLocales () {
  const locale = store.getters.locale
  const fallbackLocale = store.getters.fallbackLocale
  if (locale && fallbackLocale) return [locale, fallbackLocale]

  const navigatorLocales = navigator.languages || [navigator.language]
  const defaultLocales = []
  const supported = Object.keys(supportedLocales)
  for (const locale of navigatorLocales) {
    if (supported.includes(locale) && !defaultLocales.includes(locale)) {
      defaultLocales.push(locale)
    } else {
      const lang = locale.split('-')[0]
      if (supported.includes(lang) && !defaultLocales.includes(lang)) {
        defaultLocales.push(lang)
      }
    }
    if (defaultLocales.length === 2) break
  }

  return defaultLocales
}

function updateDocumentLocale (locale) {
  document.documentElement.lang = locale
  // FIXME can't currently change document direction easily since bootstrap still doesn't handle rtl.
  // document.dir = locale === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Loads a translation file and adds its content to the i18n plugin `messages`.
 *
 * @return {Promise<string>} Promise that resolve the given locale string
 */
function loadLocaleMessages (locale) {
  if (loadedLanguages.includes(locale)) {
    return Promise.resolve(locale)
  }
  return import(
    /* webpackChunkName: "lc/lang-[request]" */ `@/i18n/locales/${locale}`
  ).then(messages => {
    i18n.setLocaleMessage(locale, messages.default)
    loadedLanguages.push(locale)
    return locale
  })
}

/**
 * Loads a date-fns locale object
 */
async function loadDateFnsLocale (locale) {
  const dateFnsLocaleName = supportedLocales[locale].dateFnsLocale || locale
  return import(
    /* webpackChunkName: "lc/datefns-[request]" */
    `date-fns/locale/${dateFnsLocaleName}/index.js`
  ).then(locale => {
    dateFnsLocale = locale.default
  })
}

/**
 * Initialize all locales
 */
function initDefaultLocales () {
  // Get defined locales from `localStorage` or `navigator`
  const [locale, fallbackLocale] = getDefaultLocales()

  store.dispatch('UPDATE_LOCALE', locale)
  store.dispatch('UPDATE_FALLBACK_LOCALE', fallbackLocale || 'en')
  loadLocaleMessages('en')
}

export {
  initDefaultLocales,
  updateDocumentLocale,
  loadLocaleMessages,
  loadDateFnsLocale,
  dateFnsLocale
}
