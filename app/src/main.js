import { createApp, configureCompat } from 'vue'
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

configureCompat({
  MODE: 2,
  // warnings we can do something about should be fixed
  // next warnings are suppressed because those come from bootstrap-vue (vue2)
  INSTANCE_EVENT_EMITTER: 'suppress-warning',
  COMPONENT_FUNCTIONAL: 'suppress-warning',
  RENDER_FUNCTION: 'suppress-warning',
  GLOBAL_EXTEND: 'suppress-warning',
  GLOBAL_MOUNT: 'suppress-warning',
  WATCH_ARRAY: 'suppress-warning',
  GLOBAL_PROTOTYPE: 'suppress-warning',
  INSTANCE_SCOPED_SLOTS: 'suppress-warning',
  INSTANCE_LISTENERS: 'suppress-warning',
  OPTIONS_DATA_MERGE: 'suppress-warning',
  OPTIONS_BEFORE_DESTROY: 'suppress-warning',
  INSTANCE_ATTRS_CLASS_STYLE: 'suppress-warning',
  CUSTOM_DIR: 'suppress-warning',
  // TODO
  // ATTR_FALSE_VALUE: 'suppress-warning',
  // ATTR_ENUMERATED_COERCION
  // ATTR_FALSE_VALUE
  // COMPONENT_V_MODEL: 'suppress-warning',
  // COMPILER_V_BIND_SYNC
})

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
    okTitle: this.$i18n.t('ok'),
    cancelTitle: this.$i18n.t('cancel'),
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
    okTitle: this.$i18n.t('yes'),
    cancelTitle: this.$i18n.t('cancel'),
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
