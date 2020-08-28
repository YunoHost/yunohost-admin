/**
 * Settings module store.
 * @module store/settings
 */

import i18n from '@/i18n'
import { loadLocaleMessages, updateDocumentLocale } from '@/i18n/helpers'

export default {
  state: {
    locale: undefined,
    fallbackLocale: undefined
  },

  mutations: {
    'SET_LOCALE' (state, locale) {
      localStorage.setItem('locale', locale)
      state.locale = locale
    },

    'SET_FALLBACK_LOCALE' (state, locale) {
      localStorage.setItem('fallbackLocale', locale)
      state.fallbackLocale = locale
    }
  },

  actions: {
    'UPDATE_LOCALE' ({ commit }, locale) {
      loadLocaleMessages(locale).then(() => {
        i18n.locale = locale
        updateDocumentLocale(locale)
        commit('SET_LOCALE', locale)
      })
    },

    'UPDATE_FALLBACK_LOCALE' ({ commit }, locale) {
      loadLocaleMessages(locale).then(() => {
        i18n.fallbackLocale = [locale, 'en']
        commit('SET_FALLBACK_LOCALE', locale)
      })
    },

    'INIT_LOCALES' ({ commit }, { locale, fallbackLocale }) {
      commit('SET_LOCALE', locale)
      commit('SET_FALLBACK_LOCALE', fallbackLocale[0])
    }
  },

  getters: {
    locale: state => (state.locale),
    fallbackLocale: state => (state.fallbackLocale)
  }
}
