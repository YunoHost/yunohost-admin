import api from './api'

export default {
  state: () => ({
    domains: undefined,
    users: undefined
  }),
  mutations: {
    'SET_DOMAINS' (state, domains) {
      state.domains = domains
    },
    'SET_USERS' (state, users) {
      console.log(users)
      state.users = Object.keys(users).length === 0 ? null : Object.values(users)
    }
  },
  actions: {
    async 'FETCH' ({ state, commit }, { uri, force = false }) {
      // if data has already been queried, simply return
      if (state[uri] !== undefined && !force) return
      return api.get(uri).then(responseData => {
        const data = responseData[uri] ? responseData[uri] : responseData
        commit('SET_' + uri.toUpperCase(), data)
      })
    }
  },
  getters: {

  }
}
