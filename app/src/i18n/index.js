/**
 * i18n plugin module.
 * @module i18n
 */

import { createI18n } from 'vue-i18n'

export default createI18n({
  allowComposition: true, // you need to specify that!
  locale: 'en'
})

