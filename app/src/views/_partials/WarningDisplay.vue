<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <div>
    <b-card-body body-class="alert alert-warning">
      <div v-html="warning.text" />
    </b-card-body>

    <b-card-footer footer-bg-variant="warning">
      <b-button
        variant="light" size="sm"
        v-t="'ok'" @click="dismiss"
      />
    </b-card-footer>
  </div>
</template>

<script>
export default {
  name: 'WarningDisplay',

  props: {
    request: { type: Object, required: true }
  },

  computed: {
    warning () {
      const messages = this.request.messages
      return messages[messages.length - 1]
    }
  },

  methods: {
    dismiss () {
      this.$store.dispatch('DISMISS_WARNING', this.request)
    }
  }
}
</script>

<style lang="scss" scoped>
  .card-body {
    padding-bottom: 1.5rem !important;
    margin-bottom: 0;
  }
</style>
