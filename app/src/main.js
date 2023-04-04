import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import VueShowdown from 'vue-showdown'

import store from './store'
import router from './router'
import i18n from './i18n'

import { registerGlobalErrorHandlers } from './api'
import { initDefaultLocales } from './i18n/helpers'


Vue.config.productionTip = false

// Styles are imported in `src/App.vue` <style>
Vue.use(BootstrapVue, {
  BSkeleton: { animation: 'none' },
  BAlert: { show: true },
  BBadge: { pill: true }
})

Vue.use(VueShowdown, {
  options: {
    emoji: true
  }
})

// Ugly wrapper for `$bvModal.msgBoxConfirm` to set default i18n button titles
// FIXME find or wait for a better way
Vue.prototype.$askConfirmation = function (message, props) {
  return this.$bvModal.msgBoxConfirm(message, {
    okTitle: this.$i18n.t('ok'),
    cancelTitle: this.$i18n.t('cancel'),
    bodyBgVariant: 'warning',
    centered: true,
    bodyClass: ['font-weight-bold', 'rounded-top', store.state.theme ? 'text-white' : 'text-black'],
    ...props
  })
}

Vue.prototype.$askMdConfirmation = function (markdown, props, ok = false) {
  const content = this.$createElement('vue-showdown', {
    props: { markdown, flavor: 'github', options: { headerLevelStart: 4 } }
  })
  return this.$bvModal['msgBox' + (ok ? 'Ok' : 'Confirm')](content, {
    okTitle: this.$i18n.t('yes'),
    cancelTitle: this.$i18n.t('cancel'),
    headerBgVariant: 'warning',
    headerClass: store.state.theme ? 'text-white' : 'text-black',
    centered: true,
    ...props
  })
}

// Register global components
const globalComponentsModules = import.meta.glob([
  '@/components/globals/*.vue',
  '@/components/globals/*/*.vue'
], { eager: true })
Object.values(globalComponentsModules).forEach((module) => {
  const component = module.default
  Vue.component(component.name, component)
})

registerGlobalErrorHandlers()

// Load default locales translations files and setup store data
initDefaultLocales().then(() => {
  const app = new Vue({
    store,
    router,
    i18n,
    render: h => h(App)
  })

  app.$mount('#app')
})
