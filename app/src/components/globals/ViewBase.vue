<script setup lang="ts">
import type { Component } from 'vue'

defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    loading?: boolean
    skeleton?: string | Component
  }>(),
  {
    loading: false,
    skeleton: 'CardFormSkeleton',
  },
)

const slots = defineSlots<{
  'top-bar-group-left': any
  'top-bar-group-right': any
  'top-bar': any
  top: any
  default: any
  bot: any
  skeleton: any
}>()
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

    <slot name="top" />

    <BSkeletonWrapper :loading="loading">
      <template #loading>
        <slot name="skeleton">
          <Component :is="skeleton" />
        </slot>
      </template>

      <!-- Empty div to be able to receive multiple components -->
      <div>
        <slot name="default" />
      </div>
    </BSkeletonWrapper>

    <slot name="bot" />
  </div>
</template>
