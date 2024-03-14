<template>
  <BRow no-gutters class="description-row">
    <BCol v-bind="cols_" class="font-weight-bold">
      {{ label }}
    </BCol>

    <BCol>
      <!-- FIXME not sure about rendering html -->
      <div v-html="text" />
    </BCol>
  </BRow>
</template>

<script>
export default {
  name: 'ReadOnlyField',

  inheritAttrs: false,

  props: {
    label: { type: String, required: true },
    component: { type: String, default: 'InputItem' },
    value: { type: null, default: null },
    cols: { type: Object, default: () => ({ md: 4, lg: 3 }) },
  },

  computed: {
    cols_() {
      return Object.assign({ md: 4, lg: 3 }, this.cols)
    },

    text() {
      return this.parseValue(this.value)
    },
  },

  methods: {
    parseValue(value) {
      const item = this.component
      if (item === 'FileItem') value = value.file ? value.file.name : null
      if (item === 'CheckboxItem') value = this.$t(value ? 'yes' : 'no')
      if (item === 'TextAreaItem') value = value.replaceAll('\n', '<br>')
      if (Array.isArray(value)) {
        value = value.length ? value.join(this.$t('words.separator')) : null
      }
      if ([null, undefined, ''].includes(this.value))
        value = this.$t('words.none')
      return value
    },
  },
}
</script>

<style lang="scss" scoped>
.description-row {
  @include media-breakpoint-up(md) {
    margin: 1rem 0;
  }
  @include media-breakpoint-down(md) {
    flex-direction: column;
    &:not(:last-of-type) {
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: $border-width solid $card-border-color;
    }
  }
}
</style>
