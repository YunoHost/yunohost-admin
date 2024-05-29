<script setup lang="ts">
import { computed } from 'vue'

import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'

const props = withDefaults(
  defineProps<{
    alert?: boolean
    variant?: keyof typeof DEFAULT_STATUS_ICON
    icon?: string
  }>(),
  {
    alert: false,
    variant: 'info',
    icon: undefined,
  },
)

const icon = computed(() => {
  return props.icon || DEFAULT_STATUS_ICON[props.variant]
})
</script>

<template>
  <Component
    v-bind="$attrs"
    :is="alert ? 'BAlert' : 'div'"
    :modelValue="alert ? true : null"
    :variant="alert ? variant : null"
    :class="{ ['alert alert-' + variant]: !alert }"
    class="yuno-alert d-flex flex-column flex-md-row align-items-center"
  >
    <YIcon :iname="icon" class="me-md-3 mb-md-0 mb-2 md" />

    <div class="w-100">
      <slot name="default" />
    </div>
  </Component>
</template>
