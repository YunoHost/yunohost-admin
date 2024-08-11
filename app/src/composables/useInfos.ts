import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteRecordNormalized,
} from 'vue-router'
import { useRouter } from 'vue-router'

import api from '@/api'
import { timeout } from '@/helpers/commons'
import i18n from '@/i18n'
import type { CustomRoute } from '@/types/commons'
import { useDomains } from './data'
import { useRequests, type ReconnectingArgs } from './useRequests'

export const useInfos = createGlobalState(() => {
  const router = useRouter()

  const host = ref(window.location.host)
  const installed = ref<boolean | undefined>()
  const connected = useLocalStorage('connected', false)
  const yunohost = ref<{ version: string; repo: string } | undefined>()
  const routerKey = ref<string | undefined>()
  const breadcrumb = ref<CustomRoute[]>([])

  const { maybeMainDomain } = useDomains()
  const ssoLink = computed(() => {
    return `//${maybeMainDomain.value ?? host.value}/yunohost/sso`
  })

  // INIT

  async function _checkInstall(retry = 2) {
    // this action will try to query the `/installed` route 3 times every 5 s with
    // a timeout of the same delay.
    // FIXME need testing with api not responding
    try {
      const data = await timeout(
        api.get<{ installed: boolean }>('installed'),
        5000,
      )
      installed.value = data.installed
    } catch (err) {
      if (retry > 0) {
        return _checkInstall(--retry)
      }
      throw err
    }
  }

  async function onAppCreated() {
    await _checkInstall()

    if (!installed.value) {
      router.push({ name: 'post-install' })
    } else {
      _onLogin()
    }
  }

  function getYunoHostVersion() {
    return api.get('versions').then((versions) => {
      yunohost.value = versions.yunohost
    })
  }

  // CONNECTION

  async function _onLogin() {
    // If the user is not connected, the first action will throw
    // and login prompt will be shown automaticly
    await getYunoHostVersion()
    connected.value = true
    await api.get({ uri: 'domains', cachePath: 'domains' })
  }

  function onLogout(route?: RouteLocationNormalizedLoaded) {
    connected.value = false
    yunohost.value = undefined
    const previousRoute = route ?? router.currentRoute.value
    if (previousRoute.name === 'login') return
    router.push({
      name: 'login',
      // Add a redirect query if next route is not unknown (like `logout`) or `login`
      query:
        previousRoute && !['login', null].includes(previousRoute.name as any)
          ? { redirect: previousRoute.path }
          : {},
    })
  }

  function login(credentials: string) {
    return api
      .post({ uri: 'login', data: { credentials }, websocket: false })
      .then(() => _onLogin())
  }

  function logout() {
    onLogout()
    return api.get('logout')
  }

  function tryToReconnect(args?: ReconnectingArgs) {
    useRequests().reconnecting.value = args
  }

  function updateRouterKey(to?: RouteLocationNormalized) {
    if (!to) {
      // Trick to force a view reload
      routerKey.value += '0'
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
    routerKey.value = `${to.name?.toString()}-${params.join('-')}`
  }

  function updateBreadcrumb(to: RouteLocationNormalized) {
    function getRouteNames(route: RouteLocationNormalized): string[] {
      if (route.meta.breadcrumb) return route.meta.breadcrumb
      const parentRoute = route.matched
        .slice()
        .reverse()
        .find((route) => route.meta.breadcrumb)
      return parentRoute?.meta.breadcrumb || []
    }

    function formatRoute(
      route: RouteRecordNormalized | RouteLocationNormalized,
    ) {
      const { trad, param } = route.meta.args || {}
      let text = ''
      // if a traduction key string has been given and we also need to pass
      // the route param as a variable.
      if (trad && param) {
        text = i18n.global.t(trad, { [param]: to.params[param] })
      } else if (trad) {
        text = i18n.global.t(trad)
      } else if (param) {
        text = to.params[param] as string
      }
      return { to: { name: route.name! }, text }
    }

    const routeNames = getRouteNames(to)
    const allRoutes = router.getRoutes()
    breadcrumb.value = routeNames.map((name) => {
      const route = allRoutes.find((route) => route.name === name)!
      return formatRoute(route)
    })

    function getTitle(breadcrumb: CustomRoute[]) {
      if (breadcrumb.length === 0) return formatRoute(to).text
      return (breadcrumb.length > 2 ? breadcrumb.slice(-2) : breadcrumb)
        .map((route) => route.text)
        .reverse()
        .join(' / ')
    }

    // Display a simplified breadcrumb as the document title.
    document.title = `${getTitle(breadcrumb.value)} | ${i18n.global.t('yunohost_admin')}`
  }

  return {
    host,
    installed,
    connected,
    yunohost,
    routerKey,
    breadcrumb,
    ssoLink,
    onAppCreated,
    getYunoHostVersion,
    onLogout,
    login,
    logout,
    tryToReconnect,
    updateRouterKey,
    updateBreadcrumb,
  }
})
