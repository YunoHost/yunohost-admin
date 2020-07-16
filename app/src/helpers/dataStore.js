import api from './api'

export default {
  state: () => ({
    domains: undefined
  }),
  mutations: {
    'SET_DATA' (state, { key, data }) {
      state[key] = data
    }
  },
  actions: {
    async 'FETCH' ({ commit }, uri) {
      return api.get('/' + uri).then(data => {
        commit('SET_DATA', { data: data[uri], key: uri })
      })
    }
  },
  getters: {

  }
}
