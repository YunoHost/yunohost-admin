/**
 * i18n plugin module.
 * @module i18n
 */

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { getDefaultLocales, loadLocaleMessages } from './helpers'

// Plugin Initialization
Vue.use(VueI18n)

// Get defined locales from `localStorage` or `navigator`
const [locale, fallbackLocale] = getDefaultLocales()

export default new VueI18n({
  locale,
  fallbackLocale: fallbackLocale ? [fallbackLocale, 'en'] : ['en'],
  messages: {}
})

// Load default locales translations files
loadLocaleMessages(locale)
loadLocaleMessages(fallbackLocale)
loadLocaleMessages('en')
