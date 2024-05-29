<script setup lang="ts">
defineProps<{
  height: string
  width: string
}>()
</script>

<template>
  <div :style="{ height, width }" class="b-skeleton" />
</template>

<style scoped lang="scss">
.b-skeleton {
  position: relative;
  overflow: hidden;
  background-color: $gray-200;
  cursor: wait;

  height: $font-size-base;
  margin-bottom: map-get($spacers, 1);

  @if $enable-rounded {
    border-radius: 0.25rem;
  }

  [data-bs-theme='dark'] & {
    background-color: $gray-800;
  }
}
</style>
