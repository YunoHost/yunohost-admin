import Vue from 'vue'
import App from './App.vue'
import './plugins/bootstrap-vue'
import i18n from './plugins/i18n'
import router from './plugins/router'


Vue.config.productionTip = false

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app')
