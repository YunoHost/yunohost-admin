<script setup lang="ts">
import { computed } from 'vue'

import type { ReadOnlyAlertItemProps } from '@/types/form'

const props = withDefaults(defineProps<ReadOnlyAlertItemProps>(), {
  id: undefined,
  icon: undefined,
  type: 'success',
})

const icon = computed(() => {
  // TODO merge with `DEFAULT_VARIANT_ICON`
  const icons = {
    success: 'thumbs-up',
    info: 'info',
    warning: 'exclamation',
    danger: 'times',
  }

  return props.icon || icons[props.type]
})
</script>

<template>
  <!-- TODO ally: do we set it as a true alert or is it cosmetic? -->
  <YAlert :id="id" alert :icon="icon" :variant="type">
    <VueShowdown :markdown="label" tag="span" class="markdown" />
  </YAlert>
</template>
