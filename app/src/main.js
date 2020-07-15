import Vue from 'vue'
import App from './App.vue'
import './plugins/bootstrap-vue'
import i18n from './plugins/i18n'
import router from './plugins/router'
import store from './plugins/store'

import * as globalsComponents from './components/globals'

Vue.config.productionTip = false

// Register global components
for (const component of Object.values(globalsComponents)) {
  Vue.component(component.name, component)
}

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
