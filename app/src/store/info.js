import api from '@/helpers/api'

export default {
  state: {
    connected: localStorage.getItem('connected') === 'true',
    yunohost: null // yunohost app infos: Object {version, repo}
  },

  mutations: {
    'SET_CONNECTED' (state, connected) {
      localStorage.setItem('connected', connected)
      state.connected = connected
    },

    'SET_YUNOHOST_INFOS' (state, yunohost) {
      state.yunohost = yunohost
    }
  },

  actions: {
    'LOGIN' ({ commit }, password) {
      return api.post('login', { password }).then(() => {
        commit('SET_CONNECTED', true)
      }).catch(err => {
        commit('SET_CONNECTED', false)
        throw err
      })
    },

    'RESET_CONNECTED' ({ commit }) {
      commit('SET_CONNECTED', false)
      commit('SET_YUNOHOST_INFOS', null)
    },

    'LOGOUT' ({ dispatch }) {
      return api.get('logout').then(() => {
        dispatch('RESET_CONNECTED')
      })
    },

    'GET_YUNOHOST_INFOS' ({ commit }) {
      return api.get('versions').then(versions => {
        commit('SET_YUNOHOST_INFOS', versions.yunohost)
      })
    }
  },

  getters: {
    connected: state => (state.connected),
    yunohost: state => (state.yunohost)
  }
}
