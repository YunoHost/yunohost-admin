<script setup lang="ts">
import type { Breakpoint, ColorVariant } from 'bootstrap-vue-next'
import { computed } from 'vue'

import { DEFAULT_VARIANT_ICON } from '@/helpers/yunohostArguments'

const props = withDefaults(
  defineProps<{
    variant?: ColorVariant
    icon?: string
    noIcon?: boolean
    noStatus?: boolean
    size?: Breakpoint | 'xs'
    faded?: boolean
  }>(),
  {
    variant: 'light',
    icon: undefined,
    noIcon: false,
    noStatus: false,
    size: undefined,
    faded: false,
  },
)

const icon = computed(() => {
  if (props.noIcon) return
  return props.icon || DEFAULT_VARIANT_ICON[props.variant]
})
const class_ = computed(() => {
  const baseClass = 'yuno-list-group-item-'
  return [
    baseClass + props.size,
    baseClass + props.variant,
    { [baseClass + 'faded']: props.faded },
  ]
})
</script>

<template>
  <BListGroupItem v-bind="$attrs" class="yuno-list-group-item" :class="class_">
    <div v-if="!noStatus" class="yuno-list-group-item-status">
      <YIcon v-if="icon" :iname="icon" :class="['icon-' + variant]" />
    </div>

    <div class="yuno-list-group-item-content">
      <slot name="default" />
    </div>
  </BListGroupItem>
</template>

<style lang="scss" scoped>
.yuno-list-group-item {
  display: flex;
  padding: 0;

  &-status {
    width: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-content {
    width: 100%;
    padding: $list-group-item-padding-y $list-group-item-padding-x;
  }

  @each $color, $value in $theme-colors {
    &-#{$color} {
      color: tint-color($value, 50%);

      [data-bs-theme='light'] & {
        color: shade-color($value, 60%);
      }

      .yuno-list-group-item-status {
        background-color: $value;
        color: color-contrast($value);
      }
    }
  }

  &-sm,
  &-xs {
    font-size: $font-size-sm;

    .yuno-list-group-item-status {
      width: 1.25rem;
    }

    .yuno-list-group-item-content {
      padding: $tooltip-padding-y $tooltip-padding-x;
    }
  }

  &-xs {
    .yuno-list-group-item-status {
      width: 0.4rem;

      .icon {
        display: none;
      }
    }

    // .yuno-list-group-item-content {
    //   color: $black;
    // }
  }

  &-faded > * {
    opacity: 0.5;
  }
}
</style>
