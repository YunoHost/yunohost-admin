<template>
  <b-list-group
    v-bind="$attrs" ref="self"
    flush :class="{ 'fixed-height': fixedHeight, 'bordered': bordered }"
  >
    <b-list-group-item v-for="({ type, text }, i) in messages" :key="i">
      <span class="status" :class="'bg-' + type" />
      <span v-html="text" />
    </b-list-group-item>
  </b-list-group>
</template>

<script>
export default {
  name: 'MessageListGroup',

  props: {
    messages: { type: Array, required: true },
    fixedHeight: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    autoScroll: { type: Boolean, default: false }
  },

  methods: {
    scrollToEnd () {
      this.$nextTick(() => {
        const container = this.$refs.self
        container.scrollTo(0, container.lastElementChild.offsetTop)
      })
    }
  },

  created () {
    if (this.autoScroll) {
      this.$watch('messages', this.scrollToEnd)
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-height {
  max-height: 20vh;
  overflow-y: auto;
}

.bordered {
  border: $card-border-width solid $card-border-color;
  @include border-radius($card-border-radius);
}

.list-group-item {
  font-size: $font-size-sm;
  padding: $tooltip-padding-y $tooltip-padding-x;
  padding-left: 1rem;
}

.status {
  position: absolute;
  width: .4rem;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
