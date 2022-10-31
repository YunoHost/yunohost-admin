<template>
  <b-list-group
    v-bind="$attrs" flush
    :class="{ 'fixed-height': fixedHeight, 'bordered': bordered }"
    @scroll="onScroll"
  >
    <yuno-list-group-item
      v-if="limit && messages.length > limit"
      variant="info" v-t="'api.partial_logs'"
    />

    <yuno-list-group-item
      v-for="({ color, text }, i) in reducedMessages" :key="i"
      :variant="color" size="xs"
    >
      <span v-html="text" />
    </yuno-list-group-item>
  </b-list-group>
</template>

<script>
export default {
  name: 'MessageListGroup',

  props: {
    messages: { type: Array, required: true },
    fixedHeight: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    autoScroll: { type: Boolean, default: false },
    limit: { type: Number, default: null }
  },

  data () {
    return {
      auto: true
    }
  },

  computed: {
    reducedMessages () {
      const len = this.messages.length
      if (!this.limit || len <= this.limit) {
        return this.messages
      }
      return this.messages.slice(len - this.limit)
    }
  },

  methods: {
    scrollToEnd () {
      if (!this.auto) return
      this.$nextTick(() => {
        this.$el.scrollTo(0, this.$el.lastElementChild.offsetTop)
      })
    },

    onScroll ({ target }) {
      this.auto = target.scrollHeight === target.scrollTop + target.clientHeight
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
</style>
