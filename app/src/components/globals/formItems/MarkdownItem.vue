<script setup lang="ts">
defineProps<{
  label: string
  id?: string
}>()
</script>

<template>
  <VueShowdown :markdown="label" />
</template>
