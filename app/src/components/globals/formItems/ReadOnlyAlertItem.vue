<template>
  <b-alert :variant="type" show>
    <icon :iname="icon_" />
    <vue-showdown :markdown="label" flavor="github"
                  tag="span" class="markdown"
    />
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

<style lang="scss">
.icon + span.markdown > *:first-child {
  display: inline-block;
}
.alert p:last-child {
  margin-bottom: 0;
}
</style>
