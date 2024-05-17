import { createApp, type Component } from 'vue'
import App from './App.vue'
import { createBootstrap } from 'bootstrap-vue-next'
import { VueShowdownPlugin } from 'vue-showdown'

import store from './store'
import router from './router'
import i18n from './i18n'

import { registerGlobalErrorHandlers } from './api'
import { initDefaultLocales } from './i18n/helpers'

import '@/scss/main.scss'

type Module = { default: Component }

const app = createApp(App)

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
) as Record<string, Module>
Object.values(globalComponentsModules).forEach(
  ({ default: component }: Module) => {
    // FIXME component name is not automatic (there is the `__name` but it's private and may change)
    // Solution seems to use:
    // defineOptions({
    //   name: 'FormField',
    // })
    app.component(component.__name || component.name, component)
  },
)

registerGlobalErrorHandlers()

// Load default locales translations files and setup store data
initDefaultLocales().then(() => {
  app.mount('#app')
})
