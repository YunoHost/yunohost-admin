<template>
  <b-card
    v-bind="$attrs"
    no-body :class="_class"
  >
    <slot name="header" slot="header">
      <h2>
        <b-button v-b-toggle="id" :variant="variant" class="card-collapse-button">
          {{ title }}
          <icon class="ml-auto" iname="chevron-right" />
        </b-button>
      </h2>
    </slot>

    <b-collapse :id="id" :visible="visible" role="region">
      <slot name="default" />
    </b-collapse>
  </b-card>
</template>

<script>
export default {
  name: 'CollapseCard',

  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    variant: { type: String, default: 'white' },
    visible: { type: Boolean, default: false },
    flush: { type: Boolean, default: false }
  },

  computed: {
    _class () {
      const baseClass = 'card-collapse'
      return [
        baseClass,
        {
          [`${baseClass}-flush`]: this.flush,
          [`${baseClass}-${this.variant}`]: this.variant
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.card-collapse {
  .card-header {
    padding: 0;
  }

  &-button {
    display: flex;
    width: 100%;
    text-align: left;
    padding-top: $spacer * .5;
    padding-bottom: $spacer * .5;
    border-radius: 0;
    font: inherit
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
      color: color-yiq($value);
    }
  }
}
</style>
