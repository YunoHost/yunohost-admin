import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

export default new VueRouter({
  // mode: 'history', // this allow all routes to be real ones (without '#')
  base: process.env.BASE_URL,
  routes
})
