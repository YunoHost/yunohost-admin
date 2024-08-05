<script setup lang="ts">
import { useInfos } from '@/composables/useInfos'

const { breadcrumb } = useInfos()
</script>

<template>
  <BBreadcrumb v-if="breadcrumb.length">
    <BBreadcrumbItem to="/">
      <span class="visually-hidden">{{ $t('home') }}</span>
      <YIcon iname="home" />
    </BBreadcrumbItem>

    <BBreadcrumbItem
      v-for="({ to, text }, i) in breadcrumb"
      :key="i"
      :to="to"
      :active="i === breadcrumb.length - 1"
    >
      {{ text }}
    </BBreadcrumbItem>
  </BBreadcrumb>
</template>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent;
}
</style>
