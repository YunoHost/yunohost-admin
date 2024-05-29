<script setup lang="ts" generic="T extends Obj">
import type { Component } from 'vue'

import type { Obj } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    items: T[] | null
    itemsName: string | null
    filteredItems: T[] | null
    search?: string
    skeleton?: string | Component
  }>(),
  {
    search: undefined,
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

const emit = defineEmits<{
  'update:search': [value: string]
}>()
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
          :modelValue="search"
          @update:modelValue="emit('update:search', $event)"
          :placeholder="
            $t('search.for', { items: $t('items.' + itemsName, 2) })
          "
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
      <BAlert
        v-if="items === null || filteredItems === null"
        :modelValue="true"
        variant="warning"
      >
        <slot name="alert-message">
          <YIcon iname="exclamation-triangle" />
          {{
            $t(
              items === null ? 'items_verbose_count' : 'search.not_found',
              {
                items: $t('items.' + itemsName, 0),
              },
              0,
            )
          }}
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
