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

    'ADD_USERS' (state, user) {
      // FIXME will trigger an error if first created user
      Vue.set(state.users, user.username, user)
    },

    'SET_USERS_DETAILS' (state, [username, userData]) {
      Vue.set(state.users_details, username, userData)
      if (!state.users) return
      const user = state.users[username]
      for (const key of ['firstname', 'lastname', 'mail']) {
        if (user[key] !== userData[key]) {
          Vue.set(user, key, userData[key])
        }
      }
      Vue.set(user, 'fullname', `${userData.firstname} ${userData.lastname}`)
    },

    'DEL_USERS_DETAILS' (state, username) {
      Vue.delete(state.users_details, username)
      if (state.users) {
        Vue.delete(state.users, username)
      }
    }
  },

  actions: {
    'FETCH' ({ state, commit }, { uri, param, storeKey = uri, force = false }) {
      const currentState = param ? state[storeKey][param] : state[storeKey]
      // if data has already been queried, simply return
      if (currentState !== undefined && !force) return currentState

      return api.get(param ? `${uri}/${param}` : uri).then(responseData => {
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('SET_' + storeKey.toUpperCase(), param ? [param, data] : data)
        return data
      })
    },

    'FETCH_ALL' ({ state, commit }, queries) {
      // TODO do not get if data is already present
      return Promise.all(queries.map(({ uri, param, storeKey = uri, force = false }) => {
        return api.get(param ? `${uri}/${param}` : uri)
      })).then(responsesData => {
        return responsesData.map((responseData, i) => {
          const storeKey = queries[i].storeKey || queries[i].uri
          const param = queries[i].param
          const data = responseData[storeKey] ? responseData[storeKey] : responseData
          commit('SET_' + storeKey.toUpperCase(), param ? [param, data] : data)
          return data
        })
      })
    },

    'POST' ({ state, commit }, { uri, data, storeKey = uri }) {
      return api.post(uri, data).then(responseData => {
        console.log(responseData)
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('ADD_' + storeKey.toUpperCase(), data)
        return data
      })
    },

    'PUT' ({ state, commit }, { uri, param, data, storeKey = uri }) {
      return api.put(param ? `${uri}/${param}` : uri, data).then(responseData => {
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('SET_' + storeKey.toUpperCase(), param ? [param, data] : data)
        return data
      })
    },

    'DELETE' ({ state, commit }, { uri, param, data, storeKey = uri }) {
      return api.delete(param ? `${uri}/${param}` : uri, data).then(() => {
        commit('DEL_' + storeKey.toUpperCase(), param)
      })
    }
  },

  getters: {

  }
}
