<template>
  <b-alert :variant="type" show>
    <icon :iname="icon_" />
    {{ label }}
  </b-alert>
</template>

<script>
export default {
  name: 'ReadOnlyAlertItem',

  data () {
    const icons = {
      success: 'thumbs-up',
      info: 'info',
      warning: 'warning',
      danger: 'ban'
      }
    return {
      icon_: (this.icon) ? this.icon : icons[this.type]
    }
  },

  props: {
    id: { type: String, default: null },
    label: { type: String, default: null },
    type: { type: String, default: null },
    icon: { type: String, default: null }
  }
}
</script>
