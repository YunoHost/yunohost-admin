<script setup lang="ts">
import api, { objectToParams } from '@/api'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import type { CoreConfigPanels } from '@/types/core/options'

const props = defineProps<{ tabId?: string }>()

const coreConfig = await api.get<CoreConfigPanels>({
  uri: 'settings?full',
  initial: true,
})

const { form, panel, v, routes, onPanelApply } = useConfigPanels(
  formatConfigPanels(coreConfig),
  () => props.tabId,
  ({ panelId, data }, onError) => {
    // FIXME no route for potential action
    api
      .put({
        uri: `settings/${panelId}`,
        data: { args: objectToParams(data) },
        humanKey: { key: 'settings.update', panel: panelId },
      })
      .then(() => api.refetch())
      .catch(onError)
  },
)
</script>

<template>
  <ConfigPanelsComponent
    v-model="form"
    :panel="panel"
    :validations="v"
    :routes="routes"
    @apply="onPanelApply"
  />
</template>
