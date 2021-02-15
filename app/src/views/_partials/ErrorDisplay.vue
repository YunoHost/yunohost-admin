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
        <strong v-t="'api_error.error_message'" /> <span v-html="error.message" />
      </p>

      <template v-if="error.traceback">
        <p>
          <strong v-t="'traceback'" />
        </p>
        <pre><code>{{ error.traceback }}</code></pre>
      </template>

      <template v-if="hasMessages">
        <p class="my-2">
          <strong v-t="'api_error.server_said'" />
        </p>
        <message-list-group :messages="action.messages" bordered />
      </template>
    </b-card-body>

    <b-card-footer footer-bg-variant="danger">
      <!-- TODO add copy error ? -->
      <b-button
        variant="light" size="sm"
        v-t="'words.dismiss'" @click="dismiss"
      />
    </b-card-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MessageListGroup from '@/components/MessageListGroup'

export default {
  name: 'ErrorPage',

  components: {
    MessageListGroup
  },

  props: {
    action: { type: Object, required: true }
  },

  computed: {
    ...mapGetters(['error']),

    hasMessages () {
        return this.action && this.action.messages.length > 0
    }
  },

  methods: {
    dismiss () {
      if (this.error && this.error.method === 'GET') {
        history.back()
      }
      this.$store.dispatch('DELETE_ERROR')
    }
  }
}
</script>

<style lang="scss" scoped>
code, pre code {
  color: $black;
}
</style>
