<template>
  <div>
    <template v-if="canReconnect">
      <b-alert variant="success" v-t="'tools_power_up'" />
      <login-view />
    </template>

    <div v-else-if="inProcess">
      <b-alert variant="info" v-t="'tools_' + action + '_done'" />

      <b-alert variant="warning">
        <icon :iname="action === 'reboot' ? 'refresh' : 'power-off'" />
        {{ $t(action === 'reboot' ? 'tools_rebooting' : 'tools_shuttingdown') }}
      </b-alert>
    </div>

    <card v-else :title="$t('operations')" icon="wrench">
      <!-- REBOOT -->
      <b-form-group
        label-cols="5" label-cols-md="4" label-cols-lg="3"
        :label="$t('tools_reboot')" label-for="reboot"
      >
        <b-button @click="triggerAction('reboot')" variant="danger" id="reboot">
          <icon iname="refresh" /> {{ $t('tools_reboot_btn') }}
        </b-button>
      </b-form-group>
      <hr>

      <!-- SHUTDOWN -->
      <b-form-group
        label-cols="5" label-cols-md="4" label-cols-lg="3"
        :label="$t('tools_shutdown')" label-for="shutdown"
      >
        <b-button @click="triggerAction('shutdown')" variant="danger" id="shutdown">
          <icon iname="power-off" /> {{ $t('tools_shutdown_btn') }}
        </b-button>
      </b-form-group>
    </card>
  </div>
</template>

<script>
import api from '@/api'
import LoginView from '@/views/Login'

export default {
  name: 'ToolPower',

  components: {
    LoginView
  },

  data () {
    return {
      action: '',
      inProcess: false,
      canReconnect: false
    }
  },

  methods: {
    async triggerAction (action) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_reboot_action_' + action)
      )
      if (!confirmed) return

      this.action = action
      api.put(action + '?force', {}, action).then(() => {
        // Use 'RESET_CONNECTED' and not 'DISCONNECT' else user will be redirect to login
        this.$store.dispatch('RESET_CONNECTED')
        this.inProcess = true
        return this.tryToReconnect(4000)
      }).then(() => {
        this.canReconnect = true
      })
    },

    tryToReconnect (delay = 2000) {
      // FIXME need to be tested out of webpack-dev-server
      return new Promise(resolve => {
        setTimeout(() => {
          // Try to get a response from the server after boot/reboot
          api.get('logout').catch(err => {
            if (err.name === 'APIUnauthorizedError') {
              // Means the server is accessible
              resolve()
            } else {
              // FIXME could be improved by checking error types since yunohost
              resolve(this.tryToReconnect())
            }
          })
        }, delay)
      })
    }
  }
 }
</script>
