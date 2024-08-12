<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInfos } from '@/composables/useInfos'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { tryToReconnect } = useInfos()

async function triggerAction(action: 'reboot' | 'shutdown') {
  const confirmed = await modalConfirm(t('confirm_reboot_action_' + action))
  if (!confirmed) return

  api.put({ uri: action + '?force', humanKey: action }).then(() => {
    const delay = action === 'reboot' ? 4000 : 10000
    tryToReconnect({ attemps: Infinity, origin: action, delay })
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
