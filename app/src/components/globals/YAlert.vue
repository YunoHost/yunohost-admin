<template>
  <Component
    v-bind="$attrs"
    :is="alert ? 'BAlert' : 'div'"
    :modelValue="alert ? true : null"
    :variant="alert ? variant : null"
    :class="{ ['alert alert-' + variant]: !alert }"
    class="yuno-alert d-flex flex-column flex-md-row align-items-center"
  >
    <YIcon :iname="_icon" class="me-md-3 mb-md-0 mb-2 md" />

    <div class="w-100">
      <slot name="default" />
    </div>
  </Component>
</template>

<script>
import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'

export default {
  name: 'YAlert',

  props: {
    alert: { type: Boolean, default: false },
    variant: { type: String, default: 'info' },
    icon: { type: String, default: null },
  },

  computed: {
    _icon() {
      if (this.icon) return this.icon
      return DEFAULT_STATUS_ICON[this.variant]
    },
  },
}
</script>
