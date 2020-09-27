import api, { timeout } from '@/helpers/api'
import router from '@/router'

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
    'LOGIN' ({ dispatch }, password) {
      // Entering a wrong password will trigger a 401 api response.
      // action `DISCONNECT` will then be triggered by the response handler but will not
      // redirect to `/login` so the view can display the catched error.
      return api.post('login', { password }).then(() => {
        dispatch('CONNECT')
      })
    },

    'LOGOUT' ({ dispatch }) {
      return api.get('logout').then(() => {
        dispatch('DISCONNECT')
      })
    },

    'DISCONNECT' ({ commit }, route) {
      commit('SET_CONNECTED', false)
      commit('SET_YUNOHOST_INFOS', null)
      // Do not redirect if the current route is `login` so the view can display an error.
      if (router.currentRoute.name === 'login') return
      router.push({
        name: 'login',
        // Add a redirect query if next route is not unknown (like `logout`) or `login`
        query: route && !['login', null].includes(route.name)
          ? { redirect: route.path }
          : {}
      })
    },

    'CONNECT' ({ commit, dispatch }) {
      commit('SET_CONNECTED', true)
      dispatch('GET_YUNOHOST_INFOS')
      router.push(router.currentRoute.query.redirect || { name: 'home' })
    },

    'GET_YUNOHOST_INFOS' ({ commit }) {
      return api.get('versions').then(versions => {
        commit('SET_YUNOHOST_INFOS', versions.yunohost)
      })
    },

    'CHECK_INSTALL' ({ dispatch }, retry = 2) {
      // this action will try to query the `/installed` route 3 times every 5 s with
      // a timeout of the same delay.
      return timeout(api.get('installed'), 5000).then(({ installed }) => {
        return installed
      }).catch(err => {
        if (retry > 0) {
          return dispatch('CHECK_INSTALL', --retry)
        }
        throw err
      })
    }
  },

  getters: {
    connected: state => (state.connected),
    yunohost: state => (state.yunohost)
  }
}
