<script setup lang="ts">
import { useStoreGetters } from '@/store/utils'

const { breadcrumb } = useStoreGetters()
</script>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent;
}
</style>

<template>
  <BBreadcrumb v-if="breadcrumb.length">
    <BBreadcrumbItem to="/">
      <span class="visually-hidden">{{ $t('home') }}</span>
      <YIcon iname="home" />
    </BBreadcrumbItem>

    <BBreadcrumbItem
      v-for="({ name, text }, i) in breadcrumb"
      :key="name"
      :to="{ name }"
      :active="i === breadcrumb.length - 1"
    >
      {{ text }}
    </BBreadcrumbItem>
  </BBreadcrumb>
</template>
