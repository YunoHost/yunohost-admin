<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label?: string
    id?: string
    type?: 'success' | 'info' | 'warning' | 'danger'
    icon?: string
    enabled?: string | boolean
  }>(),
  {
    label: undefined,
    id: undefined,
    type: 'success',
    icon: undefined,
    enabled: true,
  },
)

const emit = defineEmits(['action'])

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
    @click="emit('action', $event)"
    :disabled="!enabled"
    class="d-block mb-3"
  >
    <YIcon :iname="icon" class="me-2" />
    <span v-html="label" />
  </BButton>
</template>
