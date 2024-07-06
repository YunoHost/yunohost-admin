<script setup lang="ts">
import { reactive, ref } from 'vue'

import api, { objectToParams } from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import ConfigPanels from '@/components/ConfigPanels.vue'
import { useInitialQueries } from '@/composables/useInitialQueries'
import {
  formatFormData,
  formatYunoHostConfigPanels,
} from '@/helpers/yunohostArguments'

const { loading, refetch } = useInitialQueries([['GET', 'settings?full']], {
  onQueriesResponse,
})
const config = ref({})
// FIXME user proper useValidate stuff
const externalResults = reactive({})

function onQueriesResponse(config_: any) {
  config.value = formatYunoHostConfigPanels(config_)
}

async function onConfigSubmit({ id, form }) {
  const args = await formatFormData(form, {
    removeEmpty: false,
    removeNull: true,
  })

  // FIXME no route for potential action
  api
    .put(
      `settings/${id}`,
      { args: objectToParams(args) },
      { key: 'settings.update', panel: id },
    )
    .then(() => refetch())
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      const panel = config.value.panels.find((panel) => panel.id === id)
      if (err.data.name) {
        Object.assign(externalResults, {
          forms: { [panel.id]: { [err.data.name]: [err.data.error] } },
        })
      } else {
        panel.serverError = err.message
      }
    })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardFormSkeleton">
    <ConfigPanels
      v-if="config.panels"
      v-bind="config"
      :external-results="externalResults"
      @apply="onConfigSubmit"
    />
  </ViewBase>
</template>
