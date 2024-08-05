<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'

const { t } = useI18n()
const store = useStore()
const modalConfirm = useAutoModal()

async function triggerAction(action) {
  const confirmed = await modalConfirm(t('confirm_reboot_action_' + action))
  if (!confirmed) return

  api.put({ uri: action + '?force', humanKey: action }).then(() => {
    const delay = action === 'reboot' ? 4000 : 10000
    store.dispatch('TRY_TO_RECONNECT', {
      attemps: Infinity,
      origin: action,
      delay,
    })
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
