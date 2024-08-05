<script setup lang="ts">
import { shallowRef } from 'vue'

import api, { objectToParams } from '@/api'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import type {
  ConfigPanelsProps,
  OnPanelApply,
} from '@/composables/configPanels'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useInitialQueries } from '@/composables/useInitialQueries'
import type { CoreConfigPanels } from '@/types/core/options'

const props = defineProps<{ tabId?: string }>()

const { loading, refetch } = useInitialQueries([{ uri: 'settings?full' }], {
  onQueriesResponse,
})
const config = shallowRef<ConfigPanelsProps | undefined>()

function onQueriesResponse(config_: CoreConfigPanels) {
  config.value = useConfigPanels(
    formatConfigPanels(config_),
    () => props.tabId,
    onPanelApply,
  )
}

const onPanelApply: OnPanelApply = ({ panelId, data }, onError) => {
  // FIXME no route for potential action
  api
    .put({
      uri: `settings/${panelId}`,
      data: { args: objectToParams(data) },
      humanKey: { key: 'settings.update', panel: panelId },
    })
    .then(() => refetch())
    .catch(onError)
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardFormSkeleton">
    <ConfigPanelsComponent
      v-if="config"
      v-model="config.form"
      :panel="config.panel.value"
      :validations="config.v.value"
      :routes="config.routes"
      @apply="config.onPanelApply"
    />
  </ViewBase>
</template>
