import { createApp } from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import { VueShowdownPlugin } from 'vue-showdown'

import store from './store'
import router from './router'
import i18n from './i18n'

import { registerGlobalErrorHandlers } from './api'
import { initDefaultLocales } from './i18n/helpers'

const app = createApp({
  ...App,
})

app.use(store)
app.use(router)
app.use(i18n)

// Styles are imported in `src/App.vue` <style>
app.use(BootstrapVue, {
  BSkeleton: { animation: 'none' },
  BAlert: { show: true },
  BBadge: { pill: true },
})

app.use(VueShowdownPlugin, {
  flavor: 'github',
  options: {
    emoji: true,
  },
})

// Ugly wrapper for `$bvModal.msgBoxConfirm` to set default i18n button titles
// FIXME find or wait for a better way
app.config.globalProperties.$askConfirmation = function (message, props) {
  return this.$bvModal.msgBoxConfirm(message, {
    okTitle: this.$t('ok'),
    cancelTitle: this.$t('cancel'),
    bodyBgVariant: 'warning',
    centered: true,
    bodyClass: [
      'font-weight-bold',
      'rounded-top',
      store.state.theme ? 'text-white' : 'text-black',
    ],
    ...props,
  })
}

app.config.globalProperties.$askMdConfirmation = function (
  markdown,
  props,
  ok = false,
) {
  const content = this.$createElement('vue-showdown', {
    props: { markdown, flavor: 'github', options: { headerLevelStart: 4 } },
  })
  return this.$bvModal['msgBox' + (ok ? 'Ok' : 'Confirm')](content, {
    okTitle: this.$t('yes'),
    cancelTitle: this.$t('cancel'),
    headerBgVariant: 'warning',
    headerClass: store.state.theme ? 'text-white' : 'text-black',
    centered: true,
    ...props,
  })
}

// Register global components
const globalComponentsModules = import.meta.glob(
  ['@/components/globals/*.vue', '@/components/globals/*/*.vue'],
  { eager: true },
)
Object.values(globalComponentsModules).forEach((module) => {
  const component = module.default
  app.component(component.name, component)
})

registerGlobalErrorHandlers()

// Load default locales translations files and setup store data
initDefaultLocales().then(() => {
  app.mount('#app')
})
