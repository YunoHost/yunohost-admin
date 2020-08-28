import Vue from 'vue'
import Vuex from 'vuex'

import info from './info'
import settings from './settings'
import data from './data'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    info,
    settings,
    data
  }
})
