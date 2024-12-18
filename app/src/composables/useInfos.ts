import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteMeta,
  RouteParamsGeneric,
  RouteRecordNameGeneric,
} from 'vue-router'
import { useRouter } from 'vue-router'

import api from '@/api'
import { timeout } from '@/helpers/commons'
import i18n from '@/i18n'
import { useDomains } from './data'
import { useRequests, type ReconnectingArgs } from './useRequests'

type BreadcrumbRoutes = {
  name: RouteRecordNameGeneric
  params: RouteParamsGeneric
  args: RouteMeta['args']
}

function formatRoute({ params, args }: BreadcrumbRoutes) {
  const { trad, param } = args
  // if a traduction key string has been given and we also need to pass
  // the route param as a variable.
  if (trad && param) {
    return i18n.global.t(trad, { [param]: params[param] })
  } else if (trad) {
    return i18n.global.t(trad)
  } else if (param) {
    return params[param] as string
  }
  return ''
}

export const useInfos = createGlobalState(() => {
  const router = useRouter()

  const host = ref(window.location.host)
  const installed = ref<boolean | undefined>()
  const connected = useLocalStorage('connected', false)
  const currentUser = useLocalStorage<string | null>('currentUser', null)
  const yunohost = ref<{ version: string; repo: string } | undefined>()
  const hasSuspenseError = ref(false)
  const routerKey = ref<string | undefined>()
  const breadcrumbRoutes = ref<BreadcrumbRoutes[]>([])

  const breadcrumb = computed(() => {
    return breadcrumbRoutes.value.map((to) => {
      return { to: { name: to.name }, text: formatRoute(to) }
    })
  })

  const htmlTitle = computed(() => {
    const bc = breadcrumb.value
    if (bc.length === 0) {
      const { name, params, meta } = router.currentRoute.value
      return formatRoute({ name, params, args: meta.args || {} })
    }
    return (bc.length > 2 ? bc.slice(-2) : bc)
      .map((route) => route.text)
      .reverse()
      .join(' / ')
  })

  const { maybeMainDomain } = useDomains()
  const ssoLink = computed(() => {
    return `//${maybeMainDomain.value ?? host.value}/yunohost/sso`
  })

  watch(router.currentRoute, (to) => {
    const routeNames =
      to.meta.breadcrumb ||
      to.matched
        .slice()
        .reverse()
        .find((route) => route.meta.breadcrumb)?.meta.breadcrumb
    if (!routeNames) {
      breadcrumbRoutes.value = []
      return
    }

    const allRoutes = router.getRoutes()
    breadcrumbRoutes.value = routeNames.map((name) => {
      const route = allRoutes.find((route) => route.name === name)
      if (!route) {
        throw Error(
          `Route ${name}, declared in breadcrumd, cannot be found in routes.`,
        )
      }
      return {
        name: route.name,
        params: to.params,
        args: route.meta.args || {},
      }
    })

    updateHtmlTitle()
    hasSuspenseError.value = false
  })

  // INIT

  async function _checkInstall(retry = 2) {
    // this action will try to query the `/installed` route 3 times every 5 s with
    // a timeout of the same delay.
    // FIXME need testing with api not responding
    try {
      const data = await timeout(
        api.get<{ installed: boolean }>({
          uri: 'installed',
          ignoreError: retry > 0,
        }),
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
      await _onLogin()
    }
  }

  function getYunoHostVersion() {
    return api
      .get<{ yunohost: { version: string; repo: string } }>('versions')
      .then((versions) => {
        yunohost.value = versions.yunohost
      })
  }

  // CONNECTION

  async function _onLogin() {
    // If the user is not connected, the first action will throw
    // and login prompt will be shown automatically
    await getYunoHostVersion()
    connected.value = true
    await api.get({ uri: 'domains', cachePath: 'domains' })
  }

  function onLogout(route?: RouteLocationNormalizedLoaded) {
    connected.value = false
    currentUser.value = null
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

  function updateHtmlTitle() {
    // Display a simplified breadcrumb as the document title.
    document.title = `${htmlTitle.value} | ${i18n.global.t('yunohost_admin')}`
  }

  return {
    host,
    installed,
    connected,
    currentUser,
    yunohost,
    hasSuspenseError,
    routerKey,
    breadcrumb,
    ssoLink,
    onAppCreated,
    getYunoHostVersion,
    onLogout,
    login,
    logout,
    tryToReconnect,
    updateHtmlTitle,
    updateRouterKey,
  }
})
