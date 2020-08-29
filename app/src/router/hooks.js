import router from './index.js'
import store from '@/store'

// Before each route request hook
router.beforeEach((to, from, next) => {
  // Allow if connected or route is not protected
  if (store.getters.connected || to.meta.noAuth) {
    next()
  } else {
    next({ name: 'login', query: { redirect: to.path } })
  }
})
