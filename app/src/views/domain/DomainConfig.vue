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

    async applyConfig (id_) {
      const formatedData = await formatFormData(
        this.config.forms[id_],
        { removeEmpty: false, removeNull: true, multipart: false }
      )

      api.put(
        `domains/${this.name}/config`,
        { key: id_, args: objectToParams(formatedData) },
        { key: 'domains.update_config', name: this.name }
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
