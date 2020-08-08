<template>
  <span :class="'icon fa fa-' + iname" aria-hidden="true" />
</template>

<script>
export default {
  name: 'Icon',
  props: {
    iname: { type: String, required: true }
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

  &.fs-sm {
    font-size: 1rem;
  }
}
</style>
