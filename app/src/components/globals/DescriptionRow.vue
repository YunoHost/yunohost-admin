<script setup lang="ts">
import { computed } from 'vue'

import type { Cols } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    term?: string
    details?: string
    cols?: Cols
  }>(),
  {
    term: undefined,
    details: undefined,
    cols: () => ({ md: 4, xl: 3 }),
  },
)

const cols = computed<Cols>(() => ({
  md: 4,
  xl: 3,
  ...props.cols,
}))
</script>

<template>
  <BRow no-gutters class="description-row">
    <BCol v-bind="cols">
      <slot name="term">
        <strong>{{ term }}</strong>
      </slot>
    </BCol>

    <BCol>
      <slot name="default">
        {{ details }}
      </slot>
    </BCol>
  </BRow>
</template>

<style lang="scss" scoped>
.description-row {
  @include media-breakpoint-up(md) {
    margin: 0.25rem 0;
    &:hover {
      background-color: rgba($black, 0.05);
      border-radius: 0.2rem;
    }
  }

  @include media-breakpoint-down(md) {
    flex-direction: column;

    &:not(:last-of-type) {
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: $border-width solid $card-border-color;
    }
  }

  .col {
    display: flex;
    align-self: start;
  }
}
</style>
