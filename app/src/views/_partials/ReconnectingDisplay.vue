<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <BCardBody>
    <BCardTitle class="text-center my-4" v-t="'api.reconnecting.title'" />

    <template v-if="status === 'reconnecting'">
      <YSpinner class="mb-4" />

      <BAlert
        v-if="origin"
        v-t="'api.reconnecting.reason.' + origin"
        :variant="origin === 'unknow' ? 'warning' : 'info'"
      />
    </template>

    <template v-if="status === 'failed'">
      <BAlert variant="danger">
        <MarkdownItem :label="$t('api.reconnecting.failed')" />
      </BAlert>

      <div class="d-flex justify-content-end">
        <BButton
          variant="success"
          v-t="'retry'"
          class="ms-auto"
          @click="tryToReconnect()"
        />
      </div>
    </template>

    <template v-if="status === 'expired'">
      <BAlert variant="success" v-t="'api.reconnecting.session_expired'" />

      <LoginView force-reload />
    </template>
  </BCardBody>
</template>

<script>
import { mapGetters } from 'vuex'

import api from '@/api'
import LoginView from '@/views/LoginView.vue'

export default {
  name: 'ReconnectingDisplay',

  components: {
    LoginView,
  },

  data() {
    return {
      status: 'reconnecting',
      origin: undefined,
    }
  },

  computed: {
    ...mapGetters(['reconnecting']),
  },

  methods: {
    tryToReconnect(initialDelay = 0) {
      this.status = 'reconnecting'
      api
        .tryToReconnect({ ...this.reconnecting, initialDelay })
        .then(() => {
          this.$store.commit('SET_RECONNECTING', null)
        })
        .catch((err) => {
          if (err.name === 'APIUnauthorizedError') {
            this.status = 'expired'
          } else {
            this.status = 'failed'
          }
        })
    },
  },

  created() {
    this.origin = this.reconnecting.origin || 'unknown'
    this.tryToReconnect(this.reconnecting.initialDelay)
  },
}
</script>
