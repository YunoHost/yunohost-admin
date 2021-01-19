/**
 * i18n plugin module.
 * @module i18n
 */

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { initDefaultLocales } from './helpers'

// Plugin Initialization
Vue.use(VueI18n)

export default new VueI18n({})

// Load default locales translations files and setup store data
initDefaultLocales()
