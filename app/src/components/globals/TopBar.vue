<script setup lang="ts">
import type { CustomRoute } from '@/types/commons'

defineProps<{
  label?: string
  button?: CustomRoute
}>()

const slots = defineSlots<{
  'group-left': any
  'group-right': any
}>()
</script>

<template>
  <BButtonToolbar :aria-label="label" id="top-bar">
    <div id="top-bar-left" class="top-bar-group" v-if="slots['group-left']">
      <slot name="group-left" />
    </div>

    <div
      v-if="slots['group-right'] || button"
      id="top-bar-right"
      class="top-bar-group"
    >
      <slot v-if="slots['group-right']" name="group-right" />

      <BButton v-else-if="button" variant="success" :to="button.to">
        <YIcon v-if="button.icon" :iname="button.icon" /> {{ button.text }}
      </BButton>
    </div>
  </BButtonToolbar>
</template>

<style lang="scss" scoped>
#top-bar {
  margin-bottom: 1rem;
  flex-wrap: wrap-reverse;

  .top-bar-group {
    display: flex;
    margin-bottom: 1rem;
  }

  @include media-breakpoint-down(sm) {
    .top-bar-group {
      flex-direction: column-reverse;
    }
  }

  @include media-breakpoint-down(md) {
    flex-direction: column-reverse;

    #top-bar-right {
      margin-bottom: 0.75rem;

      :deep(> *) {
        margin-bottom: 0.25rem;
      }
    }

    .top-bar-group {
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  @include media-breakpoint-up(md) {
    #top-bar-left {
      flex-grow: 2;
      max-width: 50%;
    }

    #top-bar-right {
      margin-left: auto;
    }

    :deep(.btn) {
      margin-left: 0.5rem;
      &.dropdown-toggle-split {
        margin-left: 0;
      }
    }
  }
}
</style>
