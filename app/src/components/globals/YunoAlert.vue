<template>
  <component
    v-bind="$attrs"
    :is="alert ? 'b-alert' : 'div'"
    :variant="alert ? variant : null"
    :class="{ ['alert alert-' + variant]: !alert }"
    class="yuno-alert d-flex flex-column flex-md-row align-items-center"
  >
    <icon :iname="_icon" class="mr-md-3 mb-md-0 mb-2 md" />

    <div class="w-100">
      <slot name="default" />
    </div>
  </component>
</template>

<script>
import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'

export default {
  name: 'YunoAlert',

  props: {
    alert: { type: Boolean, default: false },
    variant: { type: String, default: 'info' },
    icon: { type: String, default: null }
  },

  computed: {
    _icon () {
      if (this.icon) return this.icon
      return DEFAULT_STATUS_ICON[this.variant]
    }
  }
}
</script>
