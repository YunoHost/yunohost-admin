<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  id?: string
  type?: 'success' | 'info' | 'warning' | 'danger'
  icon?: string
}>()

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
    class="d-flex flex-column flex-md-row align-items-center"
    :variant="type"
    :modelValue="true"
  >
    <YIcon :iname="icon" class="me-md-3 mb-md-0 mb-2" :variant="type" />

    <VueShowdown :markdown="label" tag="span" class="markdown" />
  </BAlert>
</template>
