<template>
  <span class="explain-what">
    <slot name="default" />
    <span class="explain-what-popover-container">
      <b-button
        :id="id" href="#"
        variant="dark"
      >
        <icon iname="question" />
        <span class="sr-only">{{ $t('details_about', { subject: title }) }}</span>
      </b-button>
      <b-popover
        placement="auto"
        :target="id" triggers="click" custom-class="explain-what-popover"
        :variant="variant" :title="title"
      >
        <span v-html="content" />
      </b-popover>
    </span>
  </span>
</template>

<script>
export default {
  name: 'ExplainWhat',

  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    variant: { type: String, default: 'info' }
  },

  computed: {
    cols_ () {
      return Object.assign({ md: 4, xl: 3 }, this.cols)
    }
  }
}
</script>

<style lang="scss" scoped>
.explain-what {
  // cursor: help;

  &-popover-container {
    position: relative;
    top: -5px;
    left: -3px;
    margin-right: -3px;
  }

  .btn {
    padding: 0;
    border-radius: 50rem;
    width: 1rem;
    height: 1rem;
    background-color: transparent;
    color: $dark;
    line-height: 1.2;
    border: none;
  }

  &-popover {
    background-color: $white;
    border-width: 2px;

    ::v-deep .popover-body {
      color: $dark;
    }
  }
}
</style>
