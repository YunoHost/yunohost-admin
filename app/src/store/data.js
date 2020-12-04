import Vue from 'vue'

import api from '@/api'


export default {
  state: () => ({
    domains: undefined, // Array
    main_domain: undefined,
    users: undefined, // basic user data: Object {username: {data}}
    users_details: {}, // precise user data: Object {username: {data}}
    groups: undefined,
    permissions: undefined
  }),

  mutations: {
    'SET_DOMAINS' (state, domains) {
      state.domains = domains
    },

    'ADD_DOMAINS' (state, { domain }) {
      state.domains.push(domain)
    },

    'DEL_DOMAINS' (state, domain) {
      state.domains.splice(state.domains.indexOf(domain), 1)
    },

    'SET_MAIN_DOMAIN' (state, response) {
      state.main_domain = response.current_main_domain
    },

    'UPDATE_MAIN_DOMAIN' (state, domain) {
      state.main_domain = domain
    },

    'SET_USERS' (state, users) {
      state.users = Object.keys(users).length === 0 ? null : users
    },

    'ADD_USERS' (state, user) {
      if (!state.users) state.users = {}
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

    'UPDATE_USERS_DETAILS' (state, payload) {
      // FIXME use a common function to execute the same code ?
      this.commit('SET_USERS_DETAILS', payload)
    },

    'DEL_USERS_DETAILS' (state, username) {
      Vue.delete(state.users_details, username)
      if (state.users) {
        Vue.delete(state.users, username)
        if (Object.keys(state.users).length === 0) {
          state.users = null
        }
      }
    },

    'SET_GROUPS' (state, groups) {
      state.groups = groups
    },

    'ADD_GROUPS' (state, { name }) {
      if (state.groups !== undefined) {
        Vue.set(state.groups, name, { members: [], permissions: [] })
      }
    },

    'DEL_GROUPS' (state, groupname) {
      Vue.delete(state.groups, groupname)
    },

    'SET_PERMISSIONS' (state, permissions) {
      state.permissions = permissions
    }
  },

  actions: {
    'FETCH' ({ state, commit, rootState }, { uri, param, storeKey = uri, cache = rootState.cache }) {
      const currentState = param ? state[storeKey][param] : state[storeKey]
      // if data has already been queried, simply return
      if (currentState !== undefined && cache) return currentState

      return api.get(param ? `${uri}/${param}` : uri).then(responseData => {
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('SET_' + storeKey.toUpperCase(), param ? [param, data] : data)
        return param ? state[storeKey][param] : state[storeKey]
      })
    },

    'FETCH_ALL' ({ state, commit, rootState }, queries) {
      return Promise.all(queries.map(({ uri, param, storeKey = uri, cache = rootState.cache }) => {
        const currentState = param ? state[storeKey][param] : state[storeKey]
        // if data has already been queried, simply return the state as cached
        if (currentState !== undefined && cache) {
          return { cached: currentState }
        }
        return api.get(param ? `${uri}/${param}` : uri).then(responseData => {
          return { storeKey, param, responseData }
        })
      })).then(responsesData => {
        return responsesData.map(({ storeKey, param, responseData, cached = undefined }) => {
          if (cached !== undefined) return cached
          const data = responseData[storeKey] ? responseData[storeKey] : responseData
          commit('SET_' + storeKey.toUpperCase(), param ? [param, data] : data)
          return param ? state[storeKey][param] : state[storeKey]
        })
      })
    },

    'POST' ({ state, commit }, { uri, data, storeKey = uri }) {
      return api.post(uri, data).then(responseData => {
        // FIXME api/domains returns null
        if (responseData === null) responseData = data
        responseData = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('ADD_' + storeKey.toUpperCase(), responseData)
        return state[storeKey]
      })
    },

    'PUT' ({ state, commit }, { uri, param, data, storeKey = uri }) {
      return api.put(param ? `${uri}/${param}` : uri, data).then(responseData => {
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('UPDATE_' + storeKey.toUpperCase(), param ? [param, data] : data)
        return param ? state[storeKey][param] : state[storeKey]
      })
    },

    'DELETE' ({ commit }, { uri, param, data = {}, storeKey = uri }) {
      return api.delete(param ? `${uri}/${param}` : uri, data).then(() => {
        commit('DEL_' + storeKey.toUpperCase(), param)
      })
    }
  },

  getters: {
    users: state => {
      if (state.users) return Object.values(state.users)
      return state.users
    },

    userNames: state => {
      if (state.users) return Object.keys(state.users)
      return []
    },

    usersAsChoices: state => {
      return Object.values(state.users).map(({ username, fullname, mail }) => {
          return { text: `${fullname} (${mail})`, value: username }
      })
    },

    // not cached
    user: state => name => state.users_details[name],

    domains: state => state.domains,

    mainDomain: state => state.main_domain,

    domainsAsChoices: state => {
      const mainDomain = state.main_domain
      return state.domains.map(domain => {
        return { value: domain, text: domain === mainDomain ? domain + ' ★' : domain }
      })
    }
  }
}
