import { createStore } from 'vuex'

import info from './info'
import settings from './settings'
import data from './data'

export default createStore({
  state: settings.state,
  mutations: settings.mutations,
  actions: settings.actions,
  getters: settings.getters,
  modules: {
    info,
    data,
  },
})
