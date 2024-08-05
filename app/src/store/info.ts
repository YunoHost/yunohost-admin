import router from '@/router'
import i18n from '@/i18n'
import api from '@/api'
import { timeout, isEmptyValue } from '@/helpers/commons'

export default {
  state: {
    host: window.location.host, // String
    installed: null,
    connected: localStorage.getItem('connected') === 'true', // Boolean
    yunohost: null, // Object { version, repo }
    reconnecting: null, // null|Object { attemps, delay, initialDelay }
    routerKey: undefined, // String if current route has params
    breadcrumb: [], // Array of routes
    transitionName: null, // String of CSS class if transitions are enabled
  },

  mutations: {
    SET_INSTALLED(state, boolean) {
      state.installed = boolean
    },

    SET_CONNECTED(state, boolean) {
      localStorage.setItem('connected', boolean)
      state.connected = boolean
    },

    SET_YUNOHOST_INFOS(state, yunohost) {
      state.yunohost = yunohost
    },

    SET_RECONNECTING(state, args) {
      state.reconnecting = args
    },

    SET_ROUTER_KEY(state, key) {
      state.routerKey = key
    },

    SET_BREADCRUMB(state, breadcrumb) {
      state.breadcrumb = breadcrumb
    },

    SET_TRANSITION_NAME(state, transitionName) {
      state.transitionName = transitionName
    },
  },

  actions: {
    async ON_APP_CREATED({ dispatch, state }) {
      await dispatch('CHECK_INSTALL')

      if (!state.installed) {
        router.push({ name: 'post-install' })
      } else {
        dispatch('CONNECT')
      }
    },

    async CHECK_INSTALL({ dispatch, commit }, retry = 2) {
      // this action will try to query the `/installed` route 3 times every 5 s with
      // a timeout of the same delay.
      // FIXME need testing with api not responding
      try {
        const { installed } = await timeout(api.get('installed'), 5000)
        commit('SET_INSTALLED', installed)
        return installed
      } catch (err) {
        if (retry > 0) {
          return dispatch('CHECK_INSTALL', --retry)
        }
        throw err
      }
    },

    async CONNECT({ commit, dispatch }) {
      // If the user is not connected, the first action will throw
      // and login prompt will be shown automaticly
      await dispatch('GET_YUNOHOST_INFOS')
      commit('SET_CONNECTED', true)
      await api.get({ uri: 'domains', storeKey: 'domains' })
    },

    RESET_CONNECTED({ commit }) {
      commit('SET_CONNECTED', false)
      commit('SET_YUNOHOST_INFOS', null)
    },

    DISCONNECT({ dispatch }, route) {
      // FIXME vue3 currentRoute is now a ref (currentRoute.value)
      dispatch('RESET_CONNECTED')
      if (router.currentRoute.value.name === 'login') return
      const previousRoute = route ?? router.currentRoute.value
      router.push({
        name: 'login',
        // Add a redirect query if next route is not unknown (like `logout`) or `login`
        query:
          previousRoute && !['login', null].includes(previousRoute.name)
            ? { redirect: previousRoute.path }
            : {},
      })
    },

    LOGIN({ dispatch }, credentials) {
      return api
        .post('login', { credentials }, null, { websocket: false })
        .then(() => {
          return dispatch('CONNECT')
        })
    },

    LOGOUT({ dispatch }) {
      dispatch('DISCONNECT')
      return api.get('logout')
    },

    TRY_TO_RECONNECT({ commit }, args = {}) {
      // FIXME This is very ugly arguments forwarding, will use proper component way of doing this when switching to Vue 3 (teleport)
      commit('SET_RECONNECTING', args)
    },

    GET_YUNOHOST_INFOS({ commit }) {
      return api.get('versions').then((versions) => {
        commit('SET_YUNOHOST_INFOS', versions.yunohost)
      })
    },

    UPDATE_ROUTER_KEY({ commit }, { to, from }) {
      if (isEmptyValue(to.params)) {
        commit('SET_ROUTER_KEY', undefined)
        return
      }
      // If the next route uses the same component as the previous one, Vue will not
      // recreate an instance of that component, so hooks like `created()` will not be
      // triggered and data will not be fetched.
      // For routes with params, we create a unique key to force the recreation of a view.
      // Params can be declared in route `meta` to stricly define which params should be
      // taken into account.
      const params = to.meta.routerParams
        ? to.meta.routerParams.map((key) => to.params[key])
        : Object.values(to.params)

      commit('SET_ROUTER_KEY', `${to.name}-${params.join('-')}`)
    },

    UPDATE_BREADCRUMB({ commit }, { to, from }) {
      function getRouteNames(route) {
        if (route.meta.breadcrumb) return route.meta.breadcrumb
        const parentRoute = route.matched
          .slice()
          .reverse()
          .find((route) => route.meta.breadcrumb)
        if (parentRoute) return parentRoute.meta.breadcrumb
        return []
      }

      function formatRoute(route) {
        const { trad, param } = route.meta.args || {}
        let text = ''
        // if a traduction key string has been given and we also need to pass
        // the route param as a variable.
        if (trad && param) {
          text = i18n.global.t(trad, { [param]: to.params[param] })
        } else if (trad) {
          text = i18n.global.t(trad)
        } else {
          text = to.params[param]
        }
        return { name: route.name, text }
      }

      const routeNames = getRouteNames(to)
      const allRoutes = router.getRoutes()
      const breadcrumb = routeNames.map((name) => {
        const route = allRoutes.find((route) => route.name === name)
        return formatRoute(route)
      })

      commit('SET_BREADCRUMB', breadcrumb)

      function getTitle(breadcrumb) {
        if (breadcrumb.length === 0) return formatRoute(to).text
        return (breadcrumb.length > 2 ? breadcrumb.slice(-2) : breadcrumb)
          .map((route) => route.text)
          .reverse()
          .join(' / ')
      }

      // Display a simplified breadcrumb as the document title.
      document.title = `${getTitle(breadcrumb)} | ${i18n.global.t('yunohost_admin')}`
    },

    UPDATE_TRANSITION_NAME({ state, commit }, { to, from }) {
      // Use the breadcrumb array length as a direction indicator
      const toDepth = (to.meta.breadcrumb || []).length
      const fromDepth = (from.meta.breadcrumb || []).length
      commit(
        'SET_TRANSITION_NAME',
        toDepth < fromDepth ? 'slide-right' : 'slide-left',
      )
    },
  },

  getters: {
    host: (state) => state.host,
    installed: (state) => state.installed,
    connected: (state) => state.connected,
    yunohost: (state) => state.yunohost,
    reconnecting: (state) => state.reconnecting,
    history: (state) => state.history,
    routerKey: (state) => state.routerKey,
    breadcrumb: (state) => state.breadcrumb,
    transitionName: (state) => state.transitionName,
    ssoLink: (state, getters) => {
      return `//${getters.mainDomain ?? state.host}/yunohost/sso`
    },
  },
}
