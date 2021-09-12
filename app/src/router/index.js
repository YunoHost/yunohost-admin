import Vue from 'vue'
import VueRouter from 'vue-router'
import i18n from '@/i18n'
import routes from './routes'
import store from '@/store'

Vue.use(VueRouter)

const router = new VueRouter({
  // mode: 'history', // this allow all routes to be real ones (without '#')
  base: process.env.BASE_URL,
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
      return savedPosition || { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
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
  // Display a simplified breadcrumb as the document title.
  const routeParams = to.params
  let breadcrumb = to.meta.breadcrumb
  if (breadcrumb.length === 0) {
    breadcrumb = [to.name]
  } else if (breadcrumb.length > 2) {
    breadcrumb = breadcrumb.slice(breadcrumb.length - 2)
  }

  const title = breadcrumb.map(name => {
    const route = routes.find(route => route.name === name)
    const { trad, param } = route ? route.meta.args : {}
    // if a traduction key string has been given and we also need to pass
    // the route param as a variable.
    if (trad && param) {
      return i18n.t(trad, { [param]: routeParams[param] })
    } else if (trad) {
      return i18n.t(trad)
    }
    return routeParams[param]
  }).reverse().join(' / ')

  document.title = `${title} | ${i18n.t('yunohost_admin')}`
})

export default router
