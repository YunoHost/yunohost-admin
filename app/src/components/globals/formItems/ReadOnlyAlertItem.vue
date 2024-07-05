<script setup lang="ts">
import { computed } from 'vue'

import type { ReadOnlyAlertItemProps } from '@/types/form'

const props = withDefaults(defineProps<ReadOnlyAlertItemProps>(), {
  id: undefined,
  icon: undefined,
  type: 'success',
})

const icon = computed(() => {
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
  <BAlert
    :id="id"
    :model-value="true"
    :variant="type"
    class="d-flex flex-column flex-md-row align-items-center"
  >
    <YIcon :iname="icon" :variant="type" class="me-md-3 mb-md-0 mb-2" />

    <VueShowdown :markdown="label" tag="span" class="markdown" />
  </BAlert>
</template>
