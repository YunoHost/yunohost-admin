<template>
  <b-button-toolbar :aria-label="label" id="top-bar" :class="unbreak + '-unbreak'">
    <div id="top-bar-left" class="top-bar-group" v-if="hasLeftSlot">
      <slot name="group-left" />
    </div>

    <div id="top-bar-right" class="top-bar-group" v-if="hasRightSlot || button">
      <slot v-if="hasRightSlot" name="group-right" />

      <b-button v-else variant="success" :to="button.to">
        <icon v-if="button.icon" :iname="button.icon" /> {{ button.text }}
      </b-button>
    </div>
  </b-button-toolbar>
</template>

<script>
export default {
  name: 'TopBar',

  props: {
    label: { type: String, default: null },
    unbreak: { type: String, default: 'md' },
    button: {
      type: Object,
      default: null,
      validator (value) {
        return ['text', 'to'].every(prop => (prop in value))
      }
    }
  },

  computed: {
    hasLeftSlot () {
      return 'group-left' in this.$slots
    },

    hasRightSlot () {
      return 'group-right' in this.$slots
    }
  }
}
</script>

<style lang="scss" scoped>
#top-bar {
  margin-bottom: 2rem;
  flex-wrap: wrap-reverse;
  flex-direction: column-reverse;

  .top-bar-group {
    display: flex;
    flex-direction: column-reverse;
    flex-wrap: wrap;
  }

  ::v-deep .top-bar-group > * {
    &:not(:first-child) {
      margin-bottom: .25rem;
    }
  }

  #top-bar-left ~ #top-bar-right {
    margin-bottom: 1rem;
  }

  @include media-breakpoint-up(sm) {
    .top-bar-group {
      flex-direction: row;
      justify-content: space-between;
    }

    ::v-deep .top-bar-group > * {
      margin-bottom: .25rem;
    }

    #top-bar-left ~ #top-bar-right {
      margin-bottom: 0.75rem;
    }
  }

  @mixin unbreak {
    flex-direction: row;

    #top-bar-left {
      flex-grow: 2;
      max-width: 75%;

      & ~ #top-bar-right {
        margin-bottom: 0;
      }
    }

    #top-bar-right {
      margin-left: auto;
    }

    ::v-deep {
      .top-bar-group > * {
        margin-bottom: 0;
        margin-left: .5rem;
      }

      #top-bar-left > :first-child {
        margin-left: 0;
      }
    }
  }

  @each $breakpoint in sm, md, lg, xl {
    &.#{$breakpoint}-unbreak {
      @include media-breakpoint-up(#{$breakpoint}) {
        @include unbreak;
      }
    }
  }
}
</style>
