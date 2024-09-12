<script setup lang="ts">
import type { MarkdownItemProps } from '@/types/form'

withDefaults(defineProps<MarkdownItemProps>(), {
  id: undefined,
})
</script>

<template>
  <VueShowdown :id="id" :markdown="label" />
</template>
