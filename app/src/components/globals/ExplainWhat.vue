<template>
  <span class="explain-what">
    <slot name="default" />
    <span class="explain-what-popover-container">
      <BButton :id="id" href="#" variant="light">
        <YIcon iname="question" />
        <span class="sr-only">
          {{ $t('details_about', { subject: title }) }}
        </span>
      </BButton>
      <BPopover
        placement="auto"
        :target="id"
        triggers="focus"
        custom-class="explain-what-popover"
        :variant="variant"
        :title="title"
      >
        <span v-html="content" />
      </BPopover>
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
    variant: { type: String, default: 'info' },
  },

  computed: {
    cols_() {
      return Object.assign({ md: 4, xl: 3 }, this.cols)
    },
  },
}
</script>

<style lang="scss" scoped>
.explain-what {
  line-height: 1.2;

  .btn {
    padding: 0;
    margin-left: 0.1rem;
    border-radius: 50rem;
    line-height: inherit;
    font-size: inherit;
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
