<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse"
    ref="view" skeleton="card-form-skeleton"
  >
    <config-panels
      v-if="config.panels" v-bind="config"
      @submit="onConfigSubmit"
    />
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

    async onConfigSubmit ({ id, form, action, name }) {
      const args = await formatFormData(form, { removeEmpty: false, removeNull: true })
      const call = action
        ? api.put(
          `domain/${this.name}/actions/${action}`,
          { args: objectToParams(args) },
          { key: 'domains.' + name, name: this.name }
        )
        : api.put(
          `domains/${this.name}/config/${id}`,
          { args: objectToParams(args) },
          { key: 'domains.update_config', id, name: this.name }
        )

      call.then(() => {
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
