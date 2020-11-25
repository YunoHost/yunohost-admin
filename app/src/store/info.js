import Vue from 'vue'
import api from '@/api'
import router from '@/router'
import { timeout } from '@/helpers/commons'

export default {
  state: {
    host: window.location.host,
    connected: localStorage.getItem('connected') === 'true',
    yunohost: null, // yunohost app infos: Object {version, repo}
    error: null,
    waiting: false,
    history: []
  },

  mutations: {
    'SET_CONNECTED' (state, connected) {
      localStorage.setItem('connected', connected)
      state.connected = connected
    },

    'SET_YUNOHOST_INFOS' (state, yunohost) {
      state.yunohost = yunohost
    },

    'UPDATE_WAITING' (state, boolean) {
      state.waiting = boolean
    },

    'ADD_HISTORY_ENTRY' (state, [uri, method, date]) {
      state.history.push({ uri, method, date, messages: [] })
    },

    'ADD_MESSAGE' (state, message) {
      state.history[state.history.length - 1].messages.push(message)
    },

    'UPDATE_PROGRESS' (state, progress) {
      Vue.set(state.history[state.history.length - 1], 'progress', progress)
    },

    'SET_ERROR' (state, error) {
      state.error = error
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

    'RESET_CONNECTED' ({ commit }) {
      commit('SET_CONNECTED', false)
      commit('SET_YUNOHOST_INFOS', null)
    },

    'DISCONNECT' ({ dispatch, commit }, route) {
      dispatch('RESET_CONNECTED')
      commit('UPDATE_WAITING', false)
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
      // FIXME need testing with api not responding
      return timeout(api.get('installed'), 5000).then(({ installed }) => {
        return installed
      }).catch(err => {
        if (retry > 0) {
          return dispatch('CHECK_INSTALL', --retry)
        }
        throw err
      })
    },

    'WAITING_FOR_RESPONSE' ({ commit }, [uri, method]) {
      commit('UPDATE_WAITING', true)
      commit('ADD_HISTORY_ENTRY', [uri, method, Date.now()])
    },

    'SERVER_RESPONDED' ({ state, dispatch, commit }, responseIsOk) {
      if (responseIsOk) {
        commit('UPDATE_WAITING', false)
        commit('SET_ERROR', '')
      }
    },

    'DISPATCH_MESSAGE' ({ commit }, messages) {
      const typeToColor = { error: 'danger' }
      for (const type in messages) {
        const message = {
          text: messages[type],
          type: type in typeToColor ? typeToColor[type] : type
        }
        let progressBar = message.text.match(/^\[#*\+*\.*\] > /)
        if (progressBar) {
          progressBar = progressBar[0]
          message.text = message.text.replace(progressBar, '')
          const progress = { '#': 0, '+': 0, '.': 0 }
          for (const char of progressBar) {
            if (char in progress) progress[char] += 1
          }
          commit('UPDATE_PROGRESS', Object.values(progress))
        }
        if (message.text) {
          commit('ADD_MESSAGE', message)
        }
      }
    },

    'DISPATCH_ERROR' ({ state, commit }, error) {
      commit('SET_ERROR', error)
      if (error.method === 'GET') {
        router.push({ name: 'error', params: { type: error.code } })
      }
      // else the waiting screen will display the error
    }
  },

  getters: {
    host: state => state.host,
    connected: state => (state.connected),
    yunohost: state => (state.yunohost),
    error: state => state.error,
    waiting: state => state.waiting,
    history: state => state.history,
    lastAction: state => state.history[state.history.length - 1]
  }
}
