<script setup lang="ts">
defineProps<{
  badges: string[],
  icon?: string,
}>()

const slots = defineSlots<{
  default?: any
}>()
</script>

<template>
    <ul class="list-inline d-inline-block mb-2">
      <li
        v-for="badge in badges"
        :key="id + '-' + badge"
        class="list-inline-item"
      >
        <BBadge class="ms-2" pill>
          <YIcon v-if="icon" :iname="icon" /> {{ badge }}
        </BBadge>
      </li>
    </ul>
</template>
