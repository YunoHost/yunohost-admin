/**
 * Settings module store.
 * @module store/settings
 */

import i18n from '@/i18n'
import { loadLocaleMessages, updateDocumentLocale, loadDateFnsLocale } from '@/i18n/helpers'
import supportedLocales from '@/i18n/supportedLocales'

export default {
  state: {
    locale: localStorage.getItem('locale'),
    fallbackLocale: localStorage.getItem('fallbackLocale'),
    cache: localStorage.getItem('cache') !== 'false',
    supportedLocales: supportedLocales
  },

  mutations: {
    'SET_LOCALE' (state, locale) {
      localStorage.setItem('locale', locale)
      state.locale = locale
    },

    'SET_FALLBACK_LOCALE' (state, locale) {
      localStorage.setItem('fallbackLocale', locale)
      state.fallbackLocale = locale
    },

    'SET_CACHE' (state, enable) {
      localStorage.setItem('cache', enable)
      state.cache = enable
    }
  },

  actions: {
    'UPDATE_LOCALE' ({ commit }, locale) {
      loadLocaleMessages(locale).then(() => {
        updateDocumentLocale(locale)
        commit('SET_LOCALE', locale)
        i18n.locale = locale
      })
      // also query the date-fns locale object for filters
      loadDateFnsLocale(locale)
    },

    'UPDATE_FALLBACK_LOCALE' ({ commit }, locale) {
      loadLocaleMessages(locale).then(() => {
        commit('SET_FALLBACK_LOCALE', locale)
        i18n.fallbackLocale = [locale, 'en']
      })
    }
  },

  getters: {
    locale: state => (state.locale),
    fallbackLocale: state => (state.fallbackLocale),
    cache: state => (state.cache),

    availableLocales: state => {
      return Object.entries(state.supportedLocales).map(([locale, { name }]) => {
        return { value: locale, text: name }
      })
    }
  }
}
