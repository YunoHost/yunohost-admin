<template>
  <BCard v-bind="$attrs" no-body :class="_class">
    <template #header>
      <slot name="header">
        <h2>
          <BButton
            v-b-toggle="id"
            :variant="variant"
            class="card-collapse-button"
          >
            {{ title }}
            <YIcon class="ml-auto" iname="chevron-right" />
          </BButton>
        </h2>
      </slot>
    </template>

    <BCollapse :id="id" :visible="visible" role="region">
      <slot name="default" />
    </BCollapse>
  </BCard>
</template>

<script>
export default {
  name: 'CardCollapse',

  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    variant: { type: String, default: 'white' },
    visible: { type: Boolean, default: false },
    flush: { type: Boolean, default: false },
  },

  computed: {
    _class() {
      const baseClass = 'card-collapse'
      return [
        baseClass,
        {
          [`${baseClass}-flush`]: this.flush,
          [`${baseClass}-${this.variant}`]: this.variant,
        },
      ]
    },
  },
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
      color: color-yiq($value);
    }
  }
}
</style>
