<script setup lang="ts">
import type { Component } from 'vue'
import { computed, ref } from 'vue'

import api from '@/api'

// FIXME type queries
const props = withDefaults(
  defineProps<{
    queries?: any[]
    queriesWait?: boolean
    skeleton?: string | Component
    loading?: boolean
  }>(),
  {
    queries: undefined,
    queriesWait: false,
    skeleton: undefined,
    loading: undefined,
  },
)

const slots = defineSlots<{
  'top-bar-group-left': any
  'top-bar-group-right': any
  'top-bar': any
  top(props: { loading: boolean }): any
  default(props: { loading: boolean }): any
  bot(props: { loading: boolean }): any
  skeleton: any
}>()

const emit = defineEmits<{
  'queries-response': any[]
}>()

defineExpose({ fetchQueries })

const fallbackLoading = ref(
  props.loading === undefined && props.queries !== undefined ? true : null,
)

const isLoading = computed(() => {
  if (props.loading !== undefined) return props.loading
  return fallbackLoading.value
})

function fetchQueries({ triggerLoading = false } = {}) {
  if (triggerLoading) {
    fallbackLoading.value = true
  }

  return api
    .fetchAll(props.queries, { wait: props.queriesWait, initial: true })
    .then((responses) => {
      emit('queries-response', ...responses)
      fallbackLoading.value = false
      return responses
    })
}

if (props.queries) {
  fetchQueries()
}
</script>

<template>
  <div>
    <TopBar v-if="slots['top-bar-group-left'] || slots['top-bar-group-right']">
      <template #group-left>
        <slot name="top-bar-group-left" />
      </template>
      <template #group-right>
        <slot name="top-bar-group-right" />
      </template>
    </TopBar>
    <slot v-else name="top-bar" />

    <slot name="top" v-bind="{ loading: isLoading }" />

    <BSkeletonWrapper :loading="isLoading">
      <template #loading>
        <slot name="skeleton">
          <Component :is="skeleton" />
        </slot>
      </template>

      <!-- Empty div to be able to receive multiple components -->
      <div>
        <slot name="default" v-bind="{ loading: isLoading }" />
      </div>
    </BSkeletonWrapper>

    <slot name="bot" v-bind="{ loading: isLoading }" />
  </div>
</template>
