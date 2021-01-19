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
    transitions: localStorage.getItem('transitions') !== 'false',
    experimental: localStorage.getItem('experimental') === 'true',
    spinner: 'pacman',
    supportedLocales: supportedLocales
  },

  mutations: {
    'SET_LOCALE' (state, locale) {
      localStorage.setItem('locale', locale)
      state.locale = locale
    },

    'SET_FALLBACKLOCALE' (state, locale) {
      localStorage.setItem('fallbackLocale', locale)
      state.fallbackLocale = locale
    },

    'SET_CACHE' (state, boolean) {
      localStorage.setItem('cache', boolean)
      state.cache = boolean
    },

    'SET_TRANSITIONS' (state, boolean) {
      localStorage.setItem('transitions', boolean)
      state.transitions = boolean
    },

    'SET_EXPERIMENTAL' (state, boolean) {
      localStorage.setItem('experimental', boolean)
      state.experimental = boolean
    },

    'SET_SPINNER' (state, spinner) {
      state.spinner = spinner
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

    'UPDATE_FALLBACKLOCALE' ({ commit }, locale) {
      loadLocaleMessages(locale).then(() => {
        commit('SET_FALLBACKLOCALE', locale)
        i18n.fallbackLocale = [locale, 'en']
      })
    }
  },

  getters: {
    locale: state => (state.locale),
    fallbackLocale: state => (state.fallbackLocale),
    cache: state => (state.cache),
    transitions: state => (state.transitions),
    experimental: state => state.experimental,
    spinner: state => state.spinner,

    availableLocales: state => {
      return Object.entries(state.supportedLocales).map(([locale, { name }]) => {
        return { value: locale, text: name }
      })
    }
  }
}
