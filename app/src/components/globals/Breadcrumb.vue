<template>
  <BBreadcrumb v-if="breadcrumb.length">
    <BBreadcrumbItem to="/">
      <span class="sr-only">{{ $t('home') }}</span>
      <YIcon iname="home" />
    </BBreadcrumbItem>

    <BBreadcrumbItem
      v-for="({ name, text }, i) in breadcrumb" :key="name"
      :to="{ name }" :active="i === breadcrumb.length - 1"
    >
      {{ text }}
    </BBreadcrumbItem>
  </BBreadcrumb>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Breadcrumb',

  computed: {
    ...mapGetters(['breadcrumb'])
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent;
}
</style>
