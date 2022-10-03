<template>
  <b-button
    :id="id"
    :variant="type"
    @click="$emit('action', $event)"
    :disabled="!enabled"
    class="d-block mb-3"
  >
    <icon :iname="icon_" class="mr-2" />
    <span v-html="label" />
  </b-button>
</template>

<script>

export default {
  name: 'ButtonItem',

  props: {
    label: { type: String, default: null },
    id: { type: String, default: null },
    type: { type: String, default: 'success' },
    icon: { type: String, default: null },
    enabled: { type: [Boolean, String], default: true }
  },

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
