import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    connected: localStorage.getItem('connected') === 'true',
    yunohostInfos: null
  },
  // Mutations must be synchronous. They are used to change the store state.
  mutations: {
    'CONNECTED' (state, connected) {
      localStorage.setItem('connected', connected)
      state.connected = connected
      if (!connected) {
        state.yunohostInfos = null
      }
    },
    'YUNOHOST_INFOS' (state, data) {
      console.log('version changed', data)
      state.yunohostInfos = data
    }
  },
  // Actions may be asynchronous. They are used to commit mutations.
  actions: {
  },
  modules: {
  }
})
