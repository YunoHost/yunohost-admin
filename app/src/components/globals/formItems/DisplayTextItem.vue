<script setup lang="ts">
import type { DisplayTextItemProps } from '@/types/form'

withDefaults(defineProps<DisplayTextItemProps>(), {
  id: undefined,
})
</script>

<template>
  <div :id="id">
    <p v-text="label" />
  </div>
</template>
