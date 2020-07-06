import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages () {
  const locales = require.context('../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

function getBrowserLocale() {
    const navigatorLocale = navigator.languages !== undefined
        ? navigator.languages[0]
        : navigator.language

    return !navigatorLocale
        ? undefined
        : navigatorLocale
}

export default new VueI18n({
  locale: getBrowserLocale(),
  fallbackLocale: 'en',
  // TODO : chunk locales json and lazy load them
  messages: loadLocaleMessages()
})
