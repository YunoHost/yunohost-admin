<template>
  <div class="tool-power">
    <div v-if="inProcess">
      <b-alert variant="info" show v-t="'tools_' + action + '_done'" />

      <b-alert variant="warning" show>
        <icon :iname="action === 'reboot' ? 'refresh' : 'power-off'" /> {{ $t(action === 'reboot' ? 'tools_rebooting' : 'tools_shuttingdown') }}
      </b-alert>
      <template v-if="canReconnect">
        <b-alert variant="success" show v-t="'tools_power_up'" />
        <login-view />
      </template>
    </div>

    <b-card v-else>
      <template v-slot:header>
        <h2><icon iname="wrench" /> {{ $t('operations') }}</h2>
      </template>

      <!-- REBOOT -->
      <b-form-group label-cols="auto" :label="$t('tools_reboot_btn')" label-for="reboot">
        <b-button
          variant="danger" id="reboot" v-b-modal.confirm-action
          @click="action = 'reboot'"
        >
          <icon iname="refresh" /> {{ $t('tools_reboot_btn') }}
        </b-button>
      </b-form-group>
      <hr>

      <!-- SHUTDOWN -->
      <b-form-group label-cols="auto" :label="$t('tools_shutdown_btn')" label-for="shutdown">
        <b-button
          variant="danger" id="shutdown" v-b-modal.confirm-action
          @click="action = 'shutdown'"
        >
          <icon iname="power-off" /> {{ $t('tools_shutdown_btn') }}
        </b-button>
      </b-form-group>

      <!-- REBOOT/SHUTDOWN CONFIRM MODAL -->
      <b-modal
        centered hide-header
        id="confirm-action" body-bg-variant="danger" body-text-variant="light"
        @ok="triggerAction(action)"
      >
        {{ $t('confirm_reboot_action_' + action) }}
      </b-modal>
    </b-card>
  </div>
</template>

<script>
import api from '@/helpers/api'
import LoginView from '@/views/Login'

export default {
  name: 'ToolPower',

  data () {
    return {
      action: '',
      inProcess: false,
      canReconnect: false
    }
  },

  methods: {
    triggerAction (action) {
      api.put(action + '?force').then(() => {
        this.$store.dispatch('RESET_CONNECTED')
        this.inProcess = true
        this.tryToReconnect()
      }).catch(err => {
        console.log('ERR', err)
      })
    },

    tryToReconnect () {
      // FIXME need to be tested out of webpack-dev-server
      setTimeout(() => {
        // Try to get a response from the server after boot/reboot
        // use `api.fetch` to not trigger base response helpers
        api.fetch('GET', 'logout').then(response => {
          // Server responds with `Unauthorized`, we can display the login input
          if (response.status === 401) {
            this.canReconnect = true
          } else {
            this.tryToReconnect()
          }
        }).catch(() => {
          this.tryToReconnect()
        })
      }, 1000)
    }
  },

  components: {
    LoginView
  }
 }
</script>
