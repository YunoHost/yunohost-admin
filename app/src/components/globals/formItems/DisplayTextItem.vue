<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
    label?: string
  }>(),
  {
    id: undefined,
    label: undefined,
  },
)
</script>

<template>
  <div>
    <p v-text="label" />
  </div>
</template>
