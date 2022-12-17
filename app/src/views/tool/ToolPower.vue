<template>
  <card :title="$t('operations')" icon="wrench">
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
</template>

<script>
import api from '@/api'


export default {
  compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: true, INSTANCE_EVENT_EMITTER: true },

  name: 'ToolPower',

  methods: {
    async triggerAction (action) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_reboot_action_' + action)
      )
      if (!confirmed) return

      this.action = action
      api.put(action + '?force', {}, action).then(() => {
        const delay = action === 'reboot' ? 4000 : 10000
        this.$store.dispatch('TRY_TO_RECONNECT', { attemps: Infinity, origin: action, delay })
      })
    }
  }
 }
</script>
