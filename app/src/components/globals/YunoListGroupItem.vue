<template>
  <b-list-group-item
    class="yuno-list-group-item" :class="_class"
    v-bind="$attrs"
  >
    <div v-if="!noStatus" class="yuno-list-group-item-status">
      <icon
        v-if="_icon" :iname="_icon"
        :class="['icon-' + variant]"
      />
    </div>

    <div class="yuno-list-group-item-content">
      <slot name="default" />
    </div>
  </b-list-group-item>
</template>

<script>
import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'

export default {
  name: 'YunoListGroupItem',

  props: {
    variant: { type: String, default: 'white' },
    icon: { type: String, default: null },
    noIcon: { type: Boolean, default: false },
    noStatus: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    faded: { type: Boolean, default: false }
  },

  computed: {
    _icon () {
      return this.noIcon ? null : this.icon || DEFAULT_STATUS_ICON[this.variant]
    },

    _class () {
      const baseClass = 'yuno-list-group-item-'
      return [
         baseClass + this.size,
         baseClass + this.variant,
        { [baseClass + 'faded']: this.faded }
      ]
    }
  }
}
</script>

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
      color: theme-color-level($color, 6);

      [dark-theme="true"] & {
        color: theme-color-level($color, -6);
      }

      .yuno-list-group-item-status {
        background-color: $value;
        color: color-yiq($value);
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
      width: .4rem;

      .icon {
        display: none;
      }
    }

    .yuno-list-group-item-content {
      color: $black;
    }
  }

  &-faded > * {
    opacity: .5;
  }
}
</style>
