/**
 * Settings module store.
 * @module store/settings
 */

import { setI18nLocale, setI18nFallbackLocale } from '@/i18n/helpers'
import supportedLocales from '@/i18n/supportedLocales'

export default {
  state: {
    locale: localStorage.getItem('locale'),
    fallbackLocale: localStorage.getItem('fallbackLocale'),
    cache: localStorage.getItem('cache') !== 'false',
    transitions: localStorage.getItem('transitions') !== 'false',
    dark: localStorage.getItem('dark') === 'true',
    experimental: localStorage.getItem('experimental') === 'true',
    spinner: 'pacman',
    supportedLocales,
  },

  mutations: {
    SET_LOCALE(state, locale) {
      localStorage.setItem('locale', locale)
      state.locale = locale
    },

    SET_FALLBACKLOCALE(state, locale) {
      localStorage.setItem('fallbackLocale', locale)
      state.fallbackLocale = locale
    },

    SET_CACHE(state, boolean) {
      localStorage.setItem('cache', boolean)
      state.cache = boolean
    },

    SET_TRANSITIONS(state, boolean) {
      localStorage.setItem('transitions', boolean)
      state.transitions = boolean
    },

    SET_EXPERIMENTAL(state, boolean) {
      localStorage.setItem('experimental', boolean)
      state.experimental = boolean
    },

    SET_SPINNER(state, spinner) {
      state.spinner = spinner
    },

    SET_DARK(state, boolean) {
      localStorage.setItem('dark', boolean)
      state.dark = boolean
      document.documentElement.setAttribute(
        'data-bs-theme',
        boolean ? 'dark' : 'light',
      )
    },
  },

  actions: {
    UPDATE_LOCALE({ commit }, locale) {
      return setI18nLocale(locale).then(() => {
        commit('SET_LOCALE', locale)
      })
    },

    UPDATE_FALLBACKLOCALE({ commit }, locale) {
      return setI18nFallbackLocale(locale).then(() => {
        commit('SET_FALLBACKLOCALE', locale)
      })
    },

    UPDATE_DARK({ commit }, boolean) {
      commit('SET_DARK', boolean)
    },
  },

  getters: {
    locale: (state) => state.locale,
    fallbackLocale: (state) => state.fallbackLocale,
    cache: (state) => state.cache,
    transitions: (state) => state.transitions,
    dark: (state) => state.dark,
    experimental: (state) => state.experimental,
    spinner: (state) => state.spinner,

    availableLocales: (state) => {
      return Object.entries(state.supportedLocales).map(
        ([locale, { name }]) => {
          return { value: locale, text: name }
        },
      )
    },
  },
}
