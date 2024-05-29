<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean }>(), { loading: false })
</script>

<template>
  <div v-if="loading" class="b-skeleton-wrapper">
    <slot name="loading" />
  </div>
  <slot v-else name="default" />
</template>

<style scoped lang="scss">
.b-skeleton-wrapper {
  cursor: wait;
}
</style>
