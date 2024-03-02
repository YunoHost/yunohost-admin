<template>
  <BAlert class="d-flex flex-column flex-md-row align-items-center" :variant="type" show>
    <YIcon :iname="icon_" class="mr-md-3 mb-md-0 mb-2" :variant="type" />

    <VueShowdown
      :markdown="label" flavor="github"
      tag="span" class="markdown"
    />
  </BAlert>
</template>

<script>
export default {
  name: 'ReadOnlyAlertItem',

  props: {
    id: { type: String, default: null },
    label: { type: String, default: null },
    type: { type: String, default: null },
    icon: { type: String, default: null }
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
