import { createRouter, createWebHashHistory } from 'vue-router'

import { useInfos } from '@/composables/useInfos'
import { useRequests } from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'
import routes from './routes'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,

  scrollBehavior(to, from, savedPosition) {
    // Mimics the native scroll behavior of the browser.
    // This allows the user to find his way back to the scroll level of the previous/next route.

    // if animations are enabled, we need to delay a bit the returned value of the saved
    // scroll state because the component probably hasn't updated the window height yet.
    // Note: this will only work with routes that use stored data or that has static content
    const { transitions } = useSettings()
    if (transitions.value && savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(savedPosition), 0)
      })
    } else {
      return savedPosition || { left: 0, top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  const { transitions, updateTransitionName } = useSettings()
  if (transitions.value && from.name !== null) {
    updateTransitionName({ to, from })
  }

  const { currentRequest, dismissModal } = useRequests()
  if (currentRequest.value?.err) {
    // In case an error is still present after code route change
    dismissModal(currentRequest.value.id)
  }

  const { installed, connected, onLogout } = useInfos()
  if (to.name === 'post-install' && installed.value) {
    return next('/')
  }
  // Allow if connected or route is not protected
  if (connected.value || to.meta.noAuth) {
    next()
  } else {
    onLogout(to)
  }
})

router.afterEach((to, from) => {
  const { updateRouterKey, updateBreadcrumb } = useInfos()
  updateRouterKey({ to, from })
  updateBreadcrumb({ to, from })
})

export default router
