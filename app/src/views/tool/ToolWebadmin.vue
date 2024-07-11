<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { asUnreffed } from '@/helpers/commons'
import { useMapStoreGetSet, useStoreGetters } from '@/store/utils'
import type { FormField } from '@/types/form'

const { t } = useI18n()
const { availableLocales } = useStoreGetters()

const form = ref({
  ...useMapStoreGetSet<Fields>({
    commit: ['cache', 'transitions', 'experimental'],
    dispatch: ['locale', 'fallbackLocale', 'dark'],
  }),
})

type Fields = {
  locale: FormField<'SelectItem', string>
  fallbackLocale: FormField<'SelectItem', string>
  cache: FormField<'CheckboxItem', boolean>
  transitions: FormField<'CheckboxItem', boolean>
  dark: FormField<'CheckboxItem', boolean>
  experimental: FormField<'CheckboxItem', boolean>
}
const fields: Fields = {
  locale: {
    component: 'SelectItem',
    label: t('tools_webadmin.language'),
    props: { id: 'locale', choices: asUnreffed(availableLocales) },
  },

  fallbackLocale: {
    component: 'SelectItem',
    label: t('tools_webadmin.fallback_language'),
    description: t('tools_webadmin.fallback_language_description'),
    props: { id: 'fallback-locale', choices: asUnreffed(availableLocales) },
  },

  cache: {
    component: 'CheckboxItem',
    id: 'cache',
    label: t('tools_webadmin.cache'),
    description: t('tools_webadmin.cache_description'),
    props: { labels: { true: 'enabled', false: 'disabled' } },
  },

  transitions: {
    component: 'CheckboxItem',
    id: 'transitions',
    label: t('tools_webadmin.transitions'),
    props: { labels: { true: 'enabled', false: 'disabled' } },
  },

  dark: {
    component: 'CheckboxItem',
    id: 'theme',
    label: t('tools_webadmin.theme'),
    props: { labels: { true: '🌙', false: '☀️' } },
  },

  experimental: {
    component: 'CheckboxItem',
    id: 'experimental',
    label: t('tools_webadmin.experimental'),
    description: t('tools_webadmin.experimental_description'),
    // Available in dev mode only
    visible: import.meta.env.DEV,
    props: { labels: { true: 'enabled', false: 'disabled' } },
  },
}
</script>

<template>
  <CardForm
    v-model="form"
    :fields="fields"
    :title="$t('tools_webadmin_settings')"
    icon="cog"
    no-footer
    hr
  />
</template>
