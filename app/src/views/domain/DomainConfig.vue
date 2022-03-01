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
  name: 'DomainConfig',

  components: {
    ConfigPanels
  },

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `domains/${this.name}/config?full`]
      ],
      config: {}
    }
  },

  methods: {
    onQueriesResponse (config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async applyConfig (id) {
      const args = await formatFormData(
        this.config.forms[id],
        { removeEmpty: false, removeNull: true }
      )

      api.put(
        `domains/${this.name}/config`,
        { key: id, args: objectToParams(args) },
        { key: 'domains.update_config', name: this.name }
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
