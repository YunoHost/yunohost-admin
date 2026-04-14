<script setup lang="ts" generic="T extends Obj | AnyTreeNode">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AnyTreeNode } from '@/helpers/data/tree'
import type { Obj } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    items?: T[] | null
    itemsName: string | null
  }>(),
  {
    items: undefined,
  },
)

const slots = defineSlots<{
  'top-bar': any
  'top-bar-buttons': any
  top: any
  'alert-message': any
  'forced-default'?: (props: { noItemsMessage?: string }) => any
  default: any
  bot: any
  skeleton: any
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = defineModel<string>()

const { t } = useI18n()
const noItemsMessage = computed(() => {
  if (props.items) return
  return t(
    props.items === undefined ? 'items_verbose_count' : 'search.not_found',
    /*
    i18n: items.domains
    i18n: items.groups
    i18n: items.installed_apps
    i18n: items.logs
    i18n: items.permissions
    i18n: items.services
    i18n: items.users
    i18n: items.items
    */
    { items: t('items.' + props.itemsName, 0) },
    0,
  )
})
</script>

<template>
  <div>
    <slot v-if="slots['top-bar']" name="top-bar" />
    <TopBar v-else>
      <template #group-left>
        <BInputGroup class="w-100">
          <BInputGroupText>
            <YIcon iname="search" />
          </BInputGroupText>

          <BFormInput
            id="top-bar-search"
            v-model="model"
            :placeholder="
              t('search.for', { items: t('items.' + itemsName, 2) })
            "
            :disabled="items === undefined"
          />
        </BInputGroup>
      </template>
      <template #group-right>
        <slot name="top-bar-buttons" />
      </template>
    </TopBar>

    <slot name="top" />

    <slot name="forced-default" v-bind="{ noItemsMessage }">
      <YAlert
        v-if="noItemsMessage"
        alert
        icon="exclamation-triangle"
        variant="warning"
      >
        {{ noItemsMessage }}
      </YAlert>
      <slot v-else name="default" />
    </slot>

    <slot name="bot" />
  </div>
</template>
