<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { t } = useI18n()
const store = useStore()

const fields = {
  locale: {
    label: t('tools_webadmin.language'),
    component: 'SelectItem',
    props: { id: 'locale', choices: [] },
  },

  fallbackLocale: {
    label: t('tools_webadmin.fallback_language'),
    description: t('tools_webadmin.fallback_language_description'),
    component: 'SelectItem',
    props: { id: 'fallback-locale', choices: [] },
  },

  cache: {
    id: 'cache',
    label: t('tools_webadmin.cache'),
    description: t('tools_webadmin.cache_description'),
    component: 'CheckboxItem',
    props: { labels: { true: 'enabled', false: 'disabled' } },
  },

  transitions: {
    id: 'transitions',
    label: t('tools_webadmin.transitions'),
    component: 'CheckboxItem',
    props: { labels: { true: 'enabled', false: 'disabled' } },
  },

  dark: {
    id: 'theme',
    label: t('tools_webadmin.theme'),
    component: 'CheckboxItem',
    props: { labels: { true: '🌙', false: '☀️' } },
  },

  // experimental: added in `created()`
}

const form = {
  ...mapStoreGetSet(['locale', 'fallbackLocale', 'dark'], 'dispatch'),
  ...mapStoreGetSet(['cache', 'transitions', 'experimental']),
}

const availableLocales = store.getters.availableLocales
fields.locale.props.choices = availableLocales
fields.fallbackLocale.props.choices = availableLocales

if (import.meta.env.DEV) {
  fields.experimental = {
    id: 'experimental',
    label: t('tools_webadmin.experimental'),
    description: t('tools_webadmin.experimental_description'),
    component: 'CheckboxItem',
    props: { labels: { true: 'enabled', false: 'disabled' } },
  }
}

// FIXME move into helpers ?
// Dynamicly generate computed properties from store with get/set and automatic commit/dispatch
function mapStoreGetSet(props = [], action = 'commit') {
  return props.reduce((obj, prop) => {
    obj[prop] = computed({
      get() {
        return store.getters[prop]
      },
      set(value) {
        const key =
          (action === 'commit' ? 'SET_' : 'UPDATE_') + prop.toUpperCase()
        store[action](key, value)
      },
    })
    return obj
  }, {})
}
</script>

<template>
  <CardForm :title="$t('tools_webadmin_settings')" icon="cog" no-footer>
    <template v-for="(field, fname) in fields" :key="fname">
      <FormField v-bind="field" v-model="form[fname]" />
      <hr />
    </template>
  </CardForm>
</template>
