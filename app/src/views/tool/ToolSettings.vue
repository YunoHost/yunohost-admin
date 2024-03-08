<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="view"
    skeleton="CardFormSkeleton"
  >
    <ConfigPanels
      v-if="config.panels"
      v-bind="config"
      :external-results="externalResults"
      @submit="onConfigSubmit"
    />
  </ViewBase>
</template>

<script>
import api, { objectToParams } from '@/api'
import {
  formatFormData,
  formatYunoHostConfigPanels,
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels.vue'

export default {
  compatConfig: { MODE: 3 },
  name: 'ToolSettingsConfig',

  components: {
    ConfigPanels,
  },

  props: {},

  data() {
    return {
      queries: [['GET', 'settings?full']],
      config: {},
      externalResults: {},
    }
  },

  methods: {
    onQueriesResponse(config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async onConfigSubmit({ id, form }) {
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
        .then(() => {
          this.$refs.view.fetchQueries({ triggerLoading: true })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          const panel = this.config.panels.find((panel) => panel.id === id)
          if (err.data.name) {
            Object.assign(this.externalResults, {
              forms: { [panel.id]: { [err.data.name]: [err.data.error] } },
            })
          } else this.$set(panel, 'serverError', err.message)
        })
    },
  },
}
</script>
