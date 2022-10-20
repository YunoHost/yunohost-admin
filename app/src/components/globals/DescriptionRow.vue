<template>
  <b-row no-gutters class="description-row">
    <b-col v-bind="cols_">
      <slot name="term">
        <strong>{{ term }}</strong>
      </slot>
    </b-col>

    <b-col>
      <slot name="default">
        {{ details }}
      </slot>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: 'DescriptionRow',

  props: {
    term: { type: String, default: null },
    details: { type: String, default: null },
    cols: { type: Object, default: () => ({ md: 4, xl: 3 }) }
  },

  computed: {
    cols_ () {
      return Object.assign({ md: 4, xl: 3 }, this.cols)
    }
  }
}
</script>

<style lang="scss" scoped>
.description-row {
  @include media-breakpoint-up(md) {
    margin: .25rem 0;
    &:hover {
      background-color: rgba($black, 0.05);
      border-radius: 0.2rem;
    }
  }

  @include media-breakpoint-down(sm) {
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
