<script setup lang="ts">
withDefaults(defineProps<{ height?: string; width?: string }>(), {
  height: '26px',
  width: '100%',
})
</script>

<template>
  <div :style="{ height, width }" class="b-skeleton" />
</template>

<style scoped lang="scss">
.b-skeleton {
  position: relative;
  overflow: hidden;
  background-color: var(--bs-secondary-bg);
  cursor: wait;

  height: $font-size-base;
  margin-bottom: map-get($spacers, 1);

  @if $enable-rounded {
    border-radius: 0.25rem;
  }
}
</style>
