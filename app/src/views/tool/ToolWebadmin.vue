<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettings } from '@/composables/useSettings'
import { getKeys, pick } from '@/helpers/commons'
import type { FormField } from '@/types/form'

const { t } = useI18n()
// Computed `t` to get on the fly lang change in this view
const ct = (key: string) => computed(() => t(key))

const settings = useSettings()

const fields = {
  locale: reactive({
    component: 'SelectItem',
    label: ct('tools_webadmin.language'),
    props: { id: 'locale', choices: settings.availableLocales },
  }) as FormField<'SelectItem', string>,

  fallbackLocale: reactive({
    component: 'SelectItem',
    label: ct('tools_webadmin.fallback_language'),
    description: ct('tools_webadmin.fallback_language_description'),
    props: {
      id: 'fallback-locale',
      choices: settings.availableLocales,
    },
  }) as FormField<'SelectItem', string>,

  cache: reactive({
    component: 'CheckboxItem',
    id: 'cache',
    label: ct('tools_webadmin.cache'),
    description: ct('tools_webadmin.cache_description'),
    props: { labels: { true: 'enabled', false: 'disabled' } },
  }) as FormField<'CheckboxItem', boolean>,

  transitions: reactive({
    component: 'CheckboxItem',
    id: 'transitions',
    label: ct('tools_webadmin.transitions'),
    props: { labels: { true: 'enabled', false: 'disabled' } },
  }) as FormField<'CheckboxItem', boolean>,

  dark: reactive({
    component: 'CheckboxItem',
    id: 'theme',
    label: ct('tools_webadmin.theme'),
    props: { labels: { true: '🌙', false: '☀️' } },
  }) as FormField<'CheckboxItem', boolean>,

  experimental: reactive({
    component: 'CheckboxItem',
    id: 'experimental',
    label: ct('tools_webadmin.experimental'),
    description: ct('tools_webadmin.experimental_description'),
    // Available in dev mode only
    visible: import.meta.env.DEV,
    props: { labels: { true: 'enabled', false: 'disabled' } },
  }) as FormField<'CheckboxItem', boolean>,
}
const form = ref(pick(settings, getKeys(fields)))

watch(form, (form) => {
  getKeys(form).forEach((k) => {
    settings[k].value = form[k]
  })
})
</script>

<template>
  <CardForm
    v-model="form"
    :fields="fields"
    :title="t('tools_webadmin_settings')"
    icon="cog"
    no-footer
    hr
  />
</template>
