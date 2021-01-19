import Vue from 'vue'
import Vuex from 'vuex'

import info from './info'
import settings from './settings'
import data from './data'

Vue.use(Vuex)

export default new Vuex.Store({
  state: settings.state,
  mutations: settings.mutations,
  actions: settings.actions,
  getters: settings.getters,
  modules: {
    info,
    data
  }
})
