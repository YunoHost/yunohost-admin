import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from '../routes'
import store from './store'


Vue.use(VueRouter)

const router = new VueRouter({
    // mode: 'history', // this allow all routes to be real ones (without '#')
    base: process.env.BASE_URL,
    routes
})

// Before each route request hook
router.beforeEach((to, from, next) => {
    // Allow if connected or route is not protected
    if (store.state.connected || to.meta.noAuth) {
        next()
    } else {
        next({name: 'login', query: {redirect: to.path}})
    }
})


export default router;
