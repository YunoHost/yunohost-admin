<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse"
    ref="view" skeleton="card-form-skeleton"
  >
    <config-panels v-if="config.panels" v-bind="config" @submit="applyConfig" />
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

    async applyConfig (id_) {
      const formatedData = await formatFormData(
        this.config.forms[id_],
        { removeEmpty: false, removeNull: true, multipart: false }
      )

      api.put(
        'settings',
        { key: id_, args: objectToParams(formatedData) },
        { key: 'settings.update', name: this.name }
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
