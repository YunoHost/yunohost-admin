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
    'ADD_USER' (state, user) {
      // FIXME will trigger an error if first created user
      Vue.set(state.users, user.username, user)
    },
    'SET_USERS_PARAM' (state, [username, userData]) {
      Vue.set(state.users_details, username, userData)
    }
  },
  actions: {
    'FETCH' ({ state, commit }, { uri, param, storeKey = uri, force = false }) {
      const currentState = param ? state[storeKey][param] : state[storeKey]
      // if data has already been queried, simply return
      if (currentState !== undefined && !force) return currentState

      return api.get(param ? `${uri}/${param}` : uri).then(responseData => {
        const data = responseData[uri] ? responseData[uri] : responseData
        if (param) {
          commit(`SET_${uri.toUpperCase()}_PARAM`, [param, data])
        } else {
          commit('SET_' + uri.toUpperCase(), data)
        }
        return param ? state[storeKey][param] : state[storeKey]
      })
    },

    'POST' ({ state, commit }, { uri, param, data, storeKey }) {
      return api.post(uri, data)
    }
  },
  getters: {

  }
}
