import { watchOnce } from '@vueuse/core'
import { createBootstrap } from 'bootstrap-vue-next'
import { createApp, type Component } from 'vue'
import { VueShowdownPlugin } from 'vue-showdown'

import App from './App.vue'
import { APIError } from './api/errors'
import { useRequests } from './composables/useRequests'
import { useSettings } from './composables/useSettings'
import i18n from './i18n'
import router from './router'
import store from './store'

import '@/scss/main.scss'

type Module = { default: Component }

const app = createApp(App)

// Error catching
function onError(err: unknown) {
  if (err instanceof APIError) {
    useRequests().handleAPIError(err)
  } else {
    // FIXME Error modal for internal code error?
    throw err
  }
}
app.config.errorHandler = (err) => onError(err)
window.addEventListener('unhandledrejection', (e) => {
  // Global catching of unhandled promise's rejections.
  // Those errors (thrown or rejected from inside a promise) can't be catched by
  // `window.onerror` or vue.
  e.preventDefault()
  onError(e.reason)
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

// Load default locales translations files then mount the app
watchOnce(useSettings().localesLoaded, () => app.mount('#app'))
