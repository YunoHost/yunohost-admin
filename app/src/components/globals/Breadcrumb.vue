<template>
  <b-breadcrumb v-if="breadcrumb.length">
    <b-breadcrumb-item to="/">
      <span class="sr-only">{{ $t('home') }}</span>
      <icon iname="home" />
    </b-breadcrumb-item>

    <b-breadcrumb-item
      v-for="({ name, text }, i) in breadcrumb" :key="name"
      :to="{ name }" :active="i === breadcrumb.length - 1"
    >
      {{ text }}
    </b-breadcrumb-item>
  </b-breadcrumb>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: true },

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
