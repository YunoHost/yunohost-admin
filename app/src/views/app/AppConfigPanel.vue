<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse"
    ref="view" skeleton="card-form-skeleton"
  >
    <config-panels v-if="config.panels" v-bind="config" @submit="applyConfig" />

    <b-alert v-else-if="config.panels === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_config_panel_no_panel') }}
    </b-alert>
  </view-base>
</template>

<script>
import api, { objectToParams } from '@/api'
import {
  formatFormData,
  formatYunoHostConfigPanels
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels'


export default {
  name: 'AppConfigPanel',

  components: {
    ConfigPanels
  },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `apps/${this.id}/config-panel?full`]
      ],
      config: {}
    }
  },

  methods: {
    onQueriesResponse (config) {
      if (!config.panels || config.panels.length === 0) {
        this.config = null
      } else {
        this.config = formatYunoHostConfigPanels(config)
      }
    },

    async applyConfig (id_) {
      const args = await formatFormData(
        this.config.forms[id_],
        { removeEmpty: false, removeNull: true }
      )

      api.put(
        `apps/${this.id}/config`,
        { key: id_, args: objectToParams(args) },
        { key: 'apps.update_config', name: this.id }
      ).then(() => {
        this.$refs.view.fetchQueries({ triggerLoading: true })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.config.panels.find(({ id }) => id_ === id)
        if (err.data.name) {
          this.config.errors[id_][err.data.name].message = err.message
        } else this.$set(panel, 'serverError', err.message)
      })
    }
  }
}
</script>
