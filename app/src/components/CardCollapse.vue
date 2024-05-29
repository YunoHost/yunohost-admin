<script setup lang="ts">
import type { ColorVariant } from 'bootstrap-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    title: string
    variant?: ColorVariant
    visible?: boolean
    flush?: boolean
  }>(),
  {
    variant: 'light',
    visible: false,
    flush: false,
  },
)

const class_ = computed(() => {
  const baseClass = 'card-collapse'
  return [
    baseClass,
    {
      [`${baseClass}-flush`]: props.flush,
      [`${baseClass}-${props.variant}`]: props.variant,
    },
  ]
})
</script>

<template>
  <BCard no-body :class="class_">
    <template #header>
      <slot name="header">
        <h2>
          <BButton
            v-b-toggle="id"
            :variant="variant"
            class="card-collapse-button"
          >
            {{ title }}
            <YIcon class="ms-auto" iname="chevron-right" />
          </BButton>
        </h2>
      </slot>
    </template>

    <BCollapse :id="id" :visible="visible" role="region">
      <slot name="default" />
    </BCollapse>
  </BCard>
</template>

<style lang="scss" scoped>
.card-collapse {
  .card-header {
    padding: 0;
  }

  &-button {
    display: flex;
    width: 100%;
    text-align: left;
    padding-top: $spacer * 0.5;
    padding-bottom: $spacer * 0.5;
    border-radius: 0;
    font: inherit;
  }

  &-flush {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
  }

  & + & {
    margin-top: 0;
    border-top: 0;
  }

  @each $color, $value in $theme-colors {
    &-#{$color} {
      background-color: $value;
      color: color-contrast($value);
    }
  }
}
</style>
