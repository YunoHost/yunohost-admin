<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { useSSE } from '@/composables/useSSE'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { tryToReconnect } = useSSE()

async function triggerAction(action: 'reboot' | 'shutdown') {
  const confirmed = await modalConfirm(t('confirm_reboot_action_' + action))
  if (!confirmed) return

  api.put({ uri: action + '?force' }).then(() => {
    const delay = action === 'reboot' ? 4000 : 10000
    tryToReconnect({ origin: action, delay })
  })
}
</script>

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
      <BButton id="reboot" variant="danger" @click="triggerAction('reboot')">
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
        id="shutdown"
        variant="danger"
        @click="triggerAction('shutdown')"
      >
        <YIcon iname="power-off" /> {{ $t('tools_shutdown_btn') }}
      </BButton>
    </BFormGroup>
  </YCard>
</template>
