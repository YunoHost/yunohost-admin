<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <div>
    <b-card-body>
      <b-card-title v-t="'api_errors_titles.' + error.name" />

      <em v-t="'api_error.sorry'" />

      <div class="alert alert-info my-3">
        <span v-html="$t('api_error.help')" />
        <br>{{ $t('api_error.info') }}
      </div>

      <!-- FIXME USE DD DL DT -->
      <p class="m-0">
        <strong v-t="'error'" />: <code>"{{ error.code }}" {{ error.status }}</code>
      </p>
      <p>
        <strong v-t="'action'" />: <code>"{{ error.method }}" {{ error.path }}</code>
      </p>

      <p>
        <strong v-t="'api_error.error_message'" />
        <b-alert class="mt-2" variant="danger">
          <div v-html="error.message" />
        </b-alert>
      </p>

      <template v-if="error.traceback">
        <p>
          <strong v-t="'traceback'" />
        </p>
        <pre><code>{{ error.traceback }}</code></pre>
      </template>

      <template v-if="messages">
        <p class="my-2">
          <strong v-t="'api_error.server_said'" />
        </p>
        <message-list-group :messages="messages" bordered />
      </template>
    </b-card-body>

    <b-card-footer footer-bg-variant="danger">
      <!-- TODO add copy error ? -->
      <b-button
        variant="light" size="sm"
        v-t="'ok'" @click="dismiss"
      />
    </b-card-footer>
  </div>
</template>

<script>
import MessageListGroup from '@/components/MessageListGroup.vue'

export default {
  name: 'ErrorDisplay',

  components: {
    MessageListGroup
  },

  props: {
    request: { type: [Object, null], default: null }
  },

  computed: {
    error () {
      return this.request.error
    },

    messages () {
      const messages = this.request.messages
      if (messages && messages.length > 0) return messages
      return null
    }
  },

  methods: {
    dismiss () {
      this.$store.dispatch('DISMISS_ERROR', this.request)
    }
  }
}
</script>

<style lang="scss" scoped>
code, pre code {
  color: $black;
}
</style>
