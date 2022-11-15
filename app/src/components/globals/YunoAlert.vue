<template>
  <component
    v-bind="$attrs"
    :is="alert ? 'b-alert' : 'div'"
    :variant="alert ? variant : null"
    :class="{ ['alert alert-' + variant]: !alert }"
    class="d-flex flex-column flex-md-row align-items-center"
  >
    <icon :iname="_icon" class="mr-md-3 mb-md-0 mb-2" :variant="variant" />

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
      return DEFAULT_STATUS_ICON[this.variant]
    }
  }
}
</script>
