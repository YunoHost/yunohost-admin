<template>
  <YCard :title="$t('operations')" icon="wrench">
    <!-- REBOOT -->
    <BFormGroup
      label-cols="5"
      label-cols-md="4"
      label-cols-lg="3"
      :label="$t('tools_reboot')"
      label-for="reboot"
    >
      <BButton @click="triggerAction('reboot')" variant="danger" id="reboot">
        <YIcon iname="refresh" /> {{ $t('tools_reboot_btn') }}
      </BButton>
    </BFormGroup>
    <hr />

    <!-- SHUTDOWN -->
    <BFormGroup
      label-cols="5"
      label-cols-md="4"
      label-cols-lg="3"
      :label="$t('tools_shutdown')"
      label-for="shutdown"
    >
      <BButton
        @click="triggerAction('shutdown')"
        variant="danger"
        id="shutdown"
      >
        <YIcon iname="power-off" /> {{ $t('tools_shutdown_btn') }}
      </BButton>
    </BFormGroup>
  </YCard>
</template>

<script>
import api from '@/api'

export default {
  name: 'ToolPower',

  methods: {
    async triggerAction(action) {
      const confirmed = await this.$askConfirmation(
        this.$t('confirm_reboot_action_' + action),
      )
      if (!confirmed) return

      this.action = action
      api.put(action + '?force', {}, action).then(() => {
        const delay = action === 'reboot' ? 4000 : 10000
        this.$store.dispatch('TRY_TO_RECONNECT', {
          attemps: Infinity,
          origin: action,
          delay,
        })
      })
    },
  },
}
</script>
