<template>
  <b-button
    :id="id"
    v-bind="$attrs"
    :disabled="!enabled || null"
    :variant="type"
    @click="$emit('action', $event)"
  >
    <icon :iname="icon_" />
    {{ label }}
  </b-button>
</template>

<script>

export default {
  compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: true },

  name: 'ButtonItem',

  props: {
    label: { type: String, default: null },
    id: { type: String, default: null },
    type: { type: String, default: 'success' },
    icon: { type: String, default: null },
    enabled: { type: [Boolean, String], default: true }
  },

  emits: ['action'],

  computed: {
    icon_ () {
      const icons = {
        success: 'thumbs-up',
        info: 'info',
        warning: 'exclamation',
        danger: 'times'
      }

      return this.icon || icons[this.type]
    }
  }
}
</script>
