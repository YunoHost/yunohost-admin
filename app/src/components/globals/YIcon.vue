<template>
  <span :class="['icon fa fa-' + iname, variant ? 'variant ' + variant : '']" aria-hidden="true" />
</template>

<script>
export default {
  name: 'Icon',
  props: {
    iname: { type: String, required: true },
    variant: { type: String, default: null }
  }
}
</script>

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
    font-size: .8rem;
    width: 1.35rem;
    min-width: 1.35rem;
    height: 1.35rem;
    line-height: 165%;
    border-radius: 50rem;

    @each $color, $value in $theme-colors {
      &.#{$color} {
        background-color: $value;
        color: color-yiq($value);
      }
    }
  }
}
</style>
