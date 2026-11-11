<script setup lang="ts">
defineProps<{
  badges: BadgeInfos[],
}>()
const slots = defineSlots<{
  default?: any
}>()
</script>

<template>
    <ul v-if="badges" class="list-inline d-inline-block ms-3 my-0">
      <li
        v-for="badge in badges"
        :key="badge.text"
        class="list-inline-item me-1"
      >
        <BBadge :variant="badge.variant" pill>
          <YIcon v-if="badge.icon" :iname="badge.icon" /> {{ badge.text }}
        </BBadge>
      </li>
    </ul>
</template>
