import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import store from '@/store'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,

  scrollBehavior (to, from, savedPosition) {
    // Mimics the native scroll behavior of the browser.
    // This allows the user to find his way back to the scroll level of the previous/next route.

    // if animations are enabled, we need to delay a bit the returned value of the saved
    // scroll state because the component probably hasn't updated the window height yet.
    // Note: this will only work with routes that use stored data or that has static content
    if (store.getters.transitions && savedPosition) {
      return new Promise(resolve => {
        setTimeout(() => resolve(savedPosition), 0)
      })
    } else {
      return savedPosition || { left: 0, top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (store.getters.transitions && from.name !== null) {
    store.dispatch('UPDATE_TRANSITION_NAME', { to, from })
  }

  if (store.getters.error) {
    store.dispatch('DISMISS_ERROR', true)
  }
  // Allow if connected or route is not protected
  if (store.getters.connected || to.meta.noAuth) {
    next()
  } else {
    store.dispatch('DISCONNECT', to)
  }
})

router.afterEach((to, from) => {
  store.dispatch('UPDATE_ROUTER_KEY', { to, from })
  store.dispatch('UPDATE_BREADCRUMB', { to, from })
})

export default router
