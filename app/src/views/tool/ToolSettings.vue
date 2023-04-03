<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse"
    ref="view" skeleton="card-form-skeleton"
  >
    <config-panels v-if="config.panels" v-bind="config" @submit="onConfigSubmit" />
  </view-base>
</template>

<script>
import api, { objectToParams } from '@/api'
import {
  formatFormData,
  formatYunoHostConfigPanels
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels.vue'


export default {
  name: 'ToolSettingsConfig',

  components: {
    ConfigPanels
  },

  props: {},

  data () {
    return {
      queries: [
        ['GET', 'settings?full']
      ],
      config: {}
    }
  },

  methods: {
    onQueriesResponse (config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async onConfigSubmit ({ id, form }) {
      const args = await formatFormData(form, { removeEmpty: false, removeNull: true })

      // FIXME no route for potential action
      api.put(
        `settings/${id}`,
        { args: objectToParams(args) },
        { key: 'settings.update', panel: id }
      ).then(() => {
        this.$refs.view.fetchQueries({ triggerLoading: true })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.config.panels.find(panel => panel.id === id)
        if (err.data.name) {
          this.config.errors[id][err.data.name].message = err.message
        } else this.$set(panel, 'serverError', err.message)
      })
    }
  }
}
</script>
