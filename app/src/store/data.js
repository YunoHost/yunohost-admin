import Vue from 'vue'

import api from '@/api'
import { isEmptyValue } from '@/helpers/commons'
import { stratify } from '@/helpers/data/tree'


export function getParentDomain (domain, domains, highest = false) {
  const method = highest ? 'lastIndexOf' : 'indexOf'
  let i = domain[method]('.')
  while (i !== -1) {
    const dn = domain.slice(i + 1)
    if (domains.includes(dn)) return dn
    i = domain[method]('.', i + (highest ? -1 : 1))
  }

  return null
}


export default {
  state: () => ({
    main_domain: undefined,
    domains: undefined, // Array
    domains_details: {},
    users: undefined, // basic user data: Object {username: {data}}
    users_details: {}, // precise user data: Object {username: {data}}
    groups: undefined,
    permissions: undefined
  }),

  mutations: {
    'SET_DOMAINS' (state, [{ domains, main }]) {
      state.domains = domains
      state.main_domain = main
    },

    'SET_DOMAINS_DETAILS' (state, [name, details]) {
      Vue.set(state.domains_details, name, details)
    },

    'UPDATE_DOMAINS_DETAILS' (state, payload) {
      // FIXME use a common function to execute the same code ?
      this.commit('SET_DOMAINS_DETAILS', payload)
    },

    'DEL_DOMAINS_DETAILS' (state, [name]) {
      Vue.delete(state.domains_details, name)
      if (state.domains) {
        Vue.delete(state.domains, name)
      }
    },

    'ADD_DOMAINS' (state, [{ domain }]) {
      state.domains.push(domain)
    },

    'DEL_DOMAINS' (state, [domain]) {
      state.domains.splice(state.domains.indexOf(domain), 1)
    },

    // Now applied thru 'SET_DOMAINS'
    // 'SET_MAIN_DOMAIN' (state, [response]) {
    //   state.main_domain = response.current_main_domain
    // },

    'UPDATE_MAIN_DOMAIN' (state, [domain]) {
      state.main_domain = domain
    },

    'SET_USERS' (state, [users]) {
      state.users = users || null
    },

    'ADD_USERS' (state, [user]) {
      if (!state.users) state.users = {}
      Vue.set(state.users, user.username, user)
    },

    'SET_USERS_DETAILS' (state, [username, userData]) {
      Vue.set(state.users_details, username, userData)
      if (!state.users) return
      const user = state.users[username]
      for (const key of ['fullname', 'mail']) {
        if (user[key] !== userData[key]) {
          Vue.set(user, key, userData[key])
        }
      }
    },

    'UPDATE_USERS_DETAILS' (state, payload) {
      // FIXME use a common function to execute the same code ?
      this.commit('SET_USERS_DETAILS', payload)
    },

    'DEL_USERS_DETAILS' (state, [username]) {
      Vue.delete(state.users_details, username)
      if (state.users) {
        Vue.delete(state.users, username)
        if (Object.keys(state.users).length === 0) {
          state.users = null
        }
      }
    },

    'SET_GROUPS' (state, [groups]) {
      state.groups = groups
    },

    'ADD_GROUPS' (state, [{ name }]) {
      if (state.groups !== undefined) {
        Vue.set(state.groups, name, { members: [], permissions: [] })
      }
    },

    'UPDATE_GROUPS' (state, [data, { groupName }]) {
      Vue.set(state.groups, groupName, data)
    },

    'DEL_GROUPS' (state, [groupname]) {
      Vue.delete(state.groups, groupname)
    },

    'SET_PERMISSIONS' (state, [permissions]) {
      state.permissions = permissions
    },

    'UPDATE_PERMISSIONS' (state, [_, { groupName, action, permId }]) {
      // FIXME hacky way to update the store
      const permissions = state.groups[groupName].permissions
      if (action === 'add') {
        permissions.push(permId)
      } else if (action === 'remove') {
        const index = permissions.indexOf(permId)
        if (index > -1) permissions.splice(index, 1)
      }
    }
  },

  actions: {
    'GET' (
      { state, commit, rootState },
      { uri, param, storeKey = uri, humanKey, noCache, options, ...extraParams }
    ) {
      const currentState = param ? state[storeKey][param] : state[storeKey]
      // if data has already been queried, simply return
      const ignoreCache = !rootState.cache || noCache || false
      if (currentState !== undefined && !ignoreCache) return currentState
      return api.fetch('GET', param ? `${uri}/${param}` : uri, null, humanKey, options).then(responseData => {
        // FIXME here's an ugly fix to be able to also cache the main domain when querying domains
        const data = storeKey === 'domains'
          ? responseData
          : responseData[storeKey] ? responseData[storeKey] : responseData
        commit(
          'SET_' + storeKey.toUpperCase(),
          [param, data, extraParams].filter(item => !isEmptyValue(item))
        )
        return param ? state[storeKey][param] : state[storeKey]
      })
    },

    'POST' ({ state, commit }, { uri, storeKey = uri, data, humanKey, options, ...extraParams }) {
      return api.fetch('POST', uri, data, humanKey, options).then(responseData => {
        // FIXME api/domains returns null
        if (responseData === null) responseData = data
        responseData = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('ADD_' + storeKey.toUpperCase(), [responseData, extraParams].filter(item => !isEmptyValue(item)))
        return state[storeKey]
      })
    },

    'PUT' ({ state, commit }, { uri, param, storeKey = uri, data, humanKey, options, ...extraParams }) {
      return api.fetch('PUT', param ? `${uri}/${param}` : uri, data, humanKey, options).then(responseData => {
        const data = responseData[storeKey] ? responseData[storeKey] : responseData
        commit('UPDATE_' + storeKey.toUpperCase(), [param, data, extraParams].filter(item => !isEmptyValue(item)))
        return param ? state[storeKey][param] : state[storeKey]
      })
    },

    'DELETE' ({ commit }, { uri, param, storeKey = uri, data, humanKey, options, ...extraParams }) {
      return api.fetch('DELETE', param ? `${uri}/${param}` : uri, data, humanKey, options).then(() => {
        commit('DEL_' + storeKey.toUpperCase(), [param, extraParams].filter(item => !isEmptyValue(item)))
      })
    },

    'RESET_CACHE_DATA' ({ state }, keys = Object.keys(state)) {
      for (const key of keys) {
        if (key === 'users_details') {
          state[key] = {}
        } else {
          state[key] = undefined
        }
      }
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

    user: state => name => state.users_details[name], // not cached

    domains: state => state.domains,

    orderedDomains: state => {
      if (!state.domains) return

      const splittedDomains = Object.fromEntries(state.domains.map(domain => {
        // Keep the main part of the domain and the extension together
        // eg: this.is.an.example.com -> ['example.com', 'an', 'is', 'this']
        domain = domain.split('.')
        domain.push(domain.pop() + domain.pop())
        return [domain, domain.reverse()]
      }))

      return state.domains.sort((a, b) => splittedDomains[a] > splittedDomains[b])
    },

    domainsTree: (state, getters) => {
      // This getter will not return any reactive data, make sure to assign its output
      // to a component's `data`.
      // FIXME manage to store the result in the store to allow reactive data (trigger an
      // action when state.domain change)
      const domains = getters.orderedDomains
      if (!domains) return
      const dataset = domains.map(name => ({
        // data to build a hierarchy
        name,
        parent: getParentDomain(name, domains),
        // utility data that will be used by `RecursiveListGroup` component
        to: { name: 'domain-info', params: { name } },
        opened: true
      }))
      return stratify(dataset)
    },

    domain: state => name => state.domains_details[name],

    highestDomainParentName: (state, getters) => name => {
      return getParentDomain(name, getters.orderedDomains, true)
    },

    mainDomain: state => state.main_domain,

    domainsAsChoices: state => {
      const mainDomain = state.main_domain
      return state.domains.map(domain => {
        return { value: domain, text: domain === mainDomain ? domain + ' ★' : domain }
      })
    }
  }
}
