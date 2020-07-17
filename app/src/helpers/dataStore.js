import Vue from 'vue'
import api from './api'

export default {
  state: () => ({
    domains: undefined, // Array
    users: undefined, // basic user data: Object {username: {data}}
    users_details: {} // precise user data: Object {username: {data}}
  }),
  mutations: {
    'SET_DOMAINS' (state, domains) {
      state.domains = domains
    },
    'SET_USERS' (state, users) {
      state.users = Object.keys(users).length === 0 ? null : users
    },
    'SET_USERS_PARAM' (state, [username, userData]) {
      Vue.set(state.users_details, username, userData)
    }
  },
  actions: {
    'FETCH' ({ state, commit, dispatch }, { uri, param, storeKey = uri, force = false }) {
      const currentState = param ? state[storeKey][param] : state[storeKey]
      // if data has already been queried, simply return
      if (currentState !== undefined && !force) return currentState
      console.log(`will query: "/${param ? `${uri}/${param}` : uri}" and will store in "${storeKey || uri}"`)
      return api.get(param ? `${uri}/${param}` : uri).then(responseData => {
        const data = responseData[uri] ? responseData[uri] : responseData
        if (param) {
          commit(`SET_${uri.toUpperCase()}_PARAM`, [param, data])
        } else {
          commit('SET_' + uri.toUpperCase(), data)
        }
        return param ? state[storeKey][param] : state[storeKey]
      })
    }
  },
  getters: {

  }
}
