<template>
  <b-button-toolbar :aria-label="label" id="top-bar">
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
    button: {
      type: Object,
      default: null,
      validator (value) {
        return ['text', 'to'].every(prop => (prop in value))
      }
    }
  },

  data () {
    return {
      hasLeftSlot: null,
      hasRightSlot: null
    }
  },

  created () {
    this.$nextTick(() => {
      this.hasLeftSlot = 'group-left' in this.$slots
      this.hasRightSlot = 'group-right' in this.$slots
    })
  }
}
</script>

<style lang="scss" scoped>
#top-bar {
  margin-bottom: 2rem;
  flex-wrap: wrap-reverse;

  .top-bar-group {
    display: flex;
  }

  @include media-breakpoint-down(xs) {
    .top-bar-group {
      flex-direction: column-reverse;
    }

    ::v-deep .btn:not(:first-of-type) {
      margin-bottom: .25rem;
    }
  }

  @include media-breakpoint-down(sm) {
    flex-direction: column-reverse;

    #top-bar-left ~ #top-bar-right {
      margin-bottom: 1rem;
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

    ::v-deep .btn {
      margin-left: .5rem;
    }
  }
}
</style>
