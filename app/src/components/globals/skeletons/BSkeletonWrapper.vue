<template>
  <div v-if="loading" class="b-skeleton-wrapper">
    <slot name="loading" />
  </div>
  <slot v-else name="default" />
</template>

<script>
export default {
  name: 'BSkeletonWrapper',

  props: {
    loading: { type: Boolean, default: false },
  },
}
</script>

<style scoped lang="scss">
.b-skeleton-wrapper {
  cursor: wait;
}
</style>
