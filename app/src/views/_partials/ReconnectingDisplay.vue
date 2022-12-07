<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <b-card-body>
    <b-card-title class="text-center my-4" v-t="'api.reconnecting.title'" />

    <template v-if="status === 'reconnecting'">
      <spinner class="mb-4" />

      <b-alert
        v-if="origin"
        v-t="'api.reconnecting.reason.' + origin"
        :variant="origin === 'unknow' ? 'warning' : 'info'"
      />
    </template>

    <template v-if="status === 'failed'">
      <b-alert variant="danger">
        <markdown-item :label="$t('api.reconnecting.failed')" />
      </b-alert>

      <div class="d-flex justify-content-end">
        <b-button
          variant="success" v-t="'retry'" class="ml-auto"
          @click="tryToReconnect()"
        />
      </div>
    </template>

    <template v-if="status === 'success'">
      <b-alert variant="success" v-t="'api.reconnecting.success'" />

      <login-view skip-install-check force-reload />
    </template>
  </b-card-body>
</template>

<script>
import { mapGetters } from 'vuex'

import api from '@/api'
import LoginView from '@/views/Login.vue'


export default {
  name: 'ReconnectingDisplay',

  components: {
    LoginView
  },

  data () {
    return {
      status: 'reconnecting',
      origin: undefined
    }
  },

  computed: {
    ...mapGetters(['reconnecting'])
  },

  methods: {
    tryToReconnect (initialDelay = 0) {
      this.status = 'reconnecting'
      api.tryToReconnect({ ...this.reconnecting, initialDelay }).then(() => {
        this.status = 'success'
      }).catch(() => {
        this.status = 'failed'
      })
    }
  },

  created () {
    this.origin = this.reconnecting.origin || 'unknown'
    this.tryToReconnect(this.reconnecting.initialDelay)
  }
}
</script>
