<script setup lang="ts">
import type { ColorVariant } from 'bootstrap-vue-next'
import { BAlert } from 'bootstrap-vue-next'
import { computed } from 'vue'

import { DEFAULT_VARIANT_ICON } from '@/helpers/yunohostArguments'

const props = withDefaults(
  defineProps<{
    alert?: boolean
    icon?: string
    variant?: ColorVariant
  }>(),
  {
    alert: false,
    icon: undefined,
    variant: 'info' as const,
  },
)

const icon = computed(() => {
  return props.icon || DEFAULT_VARIANT_ICON[props.variant]
})
</script>

<template>
  <Component
    :is="alert ? BAlert : 'div'"
    :model-value="alert ? true : undefined"
    :variant="alert ? variant : undefined"
    :class="{ ['alert alert-' + variant]: !alert }"
    class="yuno-alert d-flex flex-column flex-md-row align-items-center"
  >
    <YIcon
      v-if="icon"
      :iname="icon"
      :variant="variant"
      class="me-md-3 mb-md-0 mb-2 md"
    />

    <div class="w-100">
      <slot name="default" />
    </div>
  </Component>
</template>
