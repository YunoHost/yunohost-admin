<script setup lang="ts">
import type { ColorVariant } from 'bootstrap-vue-next'

defineProps<{
  iname: string
  variant?: ColorVariant
}>()
</script>

<template>
  <span
    :class="['icon fa fa-' + iname, variant ? 'variant ' + variant : '']"
    aria-hidden="true"
  />
</template>

<style lang="scss" scoped>
.icon {
  font-size: inherit;
  min-width: 1rem;
  text-align: center;

  &.lg {
    width: 3rem;
    font-size: 1.5rem;
    min-width: 3rem;
  }

  &.md {
    width: 1.25rem;
    font-size: 1.25rem;
    min-width: 1.25rem;
  }

  &.fs-sm {
    font-size: 1rem;
  }

  &.variant {
    font-size: 0.8rem;
    width: 1.35rem;
    min-width: 1.35rem;
    height: 1.35rem;
    line-height: 165%;
    border-radius: 50rem;

    @each $color, $value in $theme-colors {
      &.#{$color} {
        background-color: $value;
        color: color-contrast($value);
      }
    }
  }
}
</style>
