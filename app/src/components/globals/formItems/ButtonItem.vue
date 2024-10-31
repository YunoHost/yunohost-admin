<script setup lang="ts">
import { computed, toValue } from 'vue'

import type { ButtonItemProps } from '@/types/form'

const props = withDefaults(defineProps<ButtonItemProps>(), {
  enabled: true,
  icon: undefined,
  type: 'success',
})

const emit = defineEmits<{
  action: [value: string]
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
  <BButton
    :id="id"
    :variant="type"
    :disabled="!toValue(enabled)"
    class="d-block mb-3"
    @click="emit('action', id)"
  >
    <YIcon :iname="icon" class="me-2" />
    <span v-html="label" />
  </BButton>
</template>
