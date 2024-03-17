import { createApp } from 'vue'
import App from './App.vue'
import { createBootstrap } from 'bootstrap-vue-next'
import { VueShowdownPlugin } from 'vue-showdown'

import store from './store'
import router from './router'
import i18n from './i18n'

import { registerGlobalErrorHandlers } from './api'
import { initDefaultLocales } from './i18n/helpers'

import '@/scss/main.scss'

const app = createApp({
  ...App,
})

app.use(store)
app.use(router)
app.use(i18n)

app.use(createBootstrap())

app.use(VueShowdownPlugin, {
  flavor: 'github',
  options: {
    emoji: true,
  },
})

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
