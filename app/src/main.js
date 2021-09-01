import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'

import i18n from './i18n'
import router from './router'
import store from './store'

import { registerGlobalErrorHandlers } from './api'


Vue.config.productionTip = false


// Styles are imported in `src/App.vue` <style>
Vue.use(BootstrapVue, {
  BSkeleton: { animation: 'none' },
  BAlert: { show: true },
  BBadge: { pill: true },
  BModal: {
    bodyBgVariant: 'warning',
    centered: true,
    bodyClass: ['font-weight-bold', 'rounded-top']
  }
})


// Ugly wrapper for `$bvModal.msgBoxConfirm` to set default i18n button titles
// FIXME find or wait for a better way
Vue.prototype.$askConfirmation = function (message, props) {
  return this.$bvModal.msgBoxConfirm(message, {
    okTitle: this.$i18n.t('ok'),
    cancelTitle: this.$i18n.t('cancel'),
    ...props
  })
}


// Register global components
const requireComponent = require.context('@/components/globals', true, /\.(js|vue)$/i)
// For each matching file name...
requireComponent.keys().forEach((fileName) => {
  // Get the component
  const component = requireComponent(fileName).default
  // Globally register the component
  Vue.component(component.name, component)
})


registerGlobalErrorHandlers()


new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
