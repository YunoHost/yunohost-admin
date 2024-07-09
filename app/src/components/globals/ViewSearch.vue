<script setup lang="ts" generic="T extends Obj | AnyTreeNode">
import { computed, type Component } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AnyTreeNode } from '@/helpers/data/tree'
import type { Obj } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    items?: T[] | null
    itemsName: string | null
    modelValue?: string
    skeleton?: string | Component
  }>(),
  {
    items: undefined,
    modelValue: undefined,
    skeleton: 'ListGroupSkeleton',
  },
)

const slots = defineSlots<{
  'top-bar': any
  'top-bar-buttons': any
  top: any
  'alert-message': any
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
    { items: t('items.' + props.itemsName, 0) },
    0,
  )
})
</script>

<template>
  <ViewBase :skeleton="skeleton">
    <template v-if="slots['top-bar']" #top-bar>
      <slot name="top-bar" />
    </template>
    <template v-if="!slots['top-bar']" #top-bar-group-left>
      <BInputGroup class="w-100">
        <BInputGroupText>
          <YIcon iname="search" />
        </BInputGroupText>

        <BFormInput
          id="top-bar-search"
          v-model="model"
          :placeholder="t('search.for', { items: t('items.' + itemsName, 2) })"
          :disabled="!items"
        />
      </BInputGroup>
    </template>
    <template v-if="!slots['top-bar']" #top-bar-group-right>
      <slot name="top-bar-buttons" />
    </template>

    <template #top>
      <slot name="top" />
    </template>

    <template #default>
      <BAlert v-if="noItemsMessage" :model-value="true" variant="warning">
        <slot name="alert-message">
          <YIcon iname="exclamation-triangle" />
          {{ noItemsMessage }}
        </slot>
      </BAlert>

      <slot v-else name="default" />
    </template>

    <template #bot>
      <slot name="bot" />
    </template>

    <template #skeleton>
      <slot name="skeleton" />
    </template>
  </ViewBase>
</template>
