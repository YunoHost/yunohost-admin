<script setup lang="ts">
import type { CustomRoute } from '@/types/commons'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  routes: CustomRoute[]
}>()

defineSlots<{
  'tab-top': any
  'tab-before': any
  'tab-after': any
}>()
</script>

<template>
  <BCard no-body>
    <BCardHeader header-tag="nav">
      <BNav card-header fill pills>
        <BNavItem
          v-for="route in routes"
          :key="route.text"
          :to="route.to"
          :active="$route.params.tabId === route.to.params.tabId"
        >
          <!-- FIXME added :active="" because `exact-active-class` not working https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/1754 -->
          <!-- exact-active-class="active" -->
          <YIcon v-if="route.icon" :iname="route.icon" />
          {{ route.text }}
        </BNavItem>
      </BNav>
    </BCardHeader>

    <!-- Bind extra props to the child view and forward child events to parent -->
    <RouterView v-slot="{ Component }">
      <Component v-bind="$attrs" :is="Component">
        <template #tab-top>
          <slot name="tab-top" />
        </template>
        <template #tab-before>
          <slot name="tab-before" />
        </template>
        <template #tab-after>
          <slot name="tab-after" />
        </template>
      </Component>
    </RouterView>
  </BCard>
</template>
