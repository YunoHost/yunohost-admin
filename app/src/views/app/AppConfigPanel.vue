<template>
  <view-base :queries="queries" @queries-response="formatAppConfig" skeleton="card-form-skeleton">
    <template v-if="panels" #default>
      <b-alert variant="warning" class="mb-4">
        <icon iname="exclamation-triangle" /> {{ $t('experimental_warning') }}
      </b-alert>

      <!-- FIXME Rework with components -->
      <b-form id="config-form" @submit.prevent="applyConfig">
        <b-card no-body v-for="panel in panels" :key="panel.id">
          <b-card-header class="d-flex align-items-center">
            <h2>{{ panel.name }} <small v-if="panel.help">{{ panel.help }}</small></h2>

            <div class="ml-auto">
              <b-button v-b-toggle="[panel.id + '-collapse', panel.id + '-collapse-footer']" size="sm" variant="outline-secondary">
                <icon iname="chevron-right" /><span class="sr-only">{{ $t('words.collapse') }}</span>
              </b-button>
            </div>
          </b-card-header>

          <b-collapse :id="panel.id + '-collapse'" visible>
            <b-card-body v-for="section in panel.sections" :key="section.id">
              <b-card-title>{{ section.name }} <small v-if="section.help">{{ section.help }}</small></b-card-title>

              <form-item-helper v-for="arg in section.args" :key="arg.name" v-bind="arg" />
            </b-card-body>
          </b-collapse>

          <b-collapse :id="panel.id + '-collapse-footer'" visible>
            <b-card-footer>
              <b-button
                type="submit" form="config-form"
                variant="success" class="ml-auto" v-t="'save'"
              />
            </b-card-footer>
          </b-collapse>
        </b-card>
      </b-form>
    </template>

    <!-- if no config panel -->
    <b-alert v-else-if="panels === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_config_panel_no_panel') }}
    </b-alert>
  </view-base>
</template>

<script>
// FIXME needs test and rework
import api from '@/api'
import { formatI18nField, formatYunoHostArgument } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppConfigPanel',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        `apps/${this.id}/config-panel`,
        { uri: 'domains' },
        { uri: 'domains/main', storeKey: 'main_domain' },
        { uri: 'users' }
      ],
      panels: undefined
    }
  },

  methods: {
    formatAppConfig (data) {
      if (!data.config_panel || data.config_panel.length === 0) {
        this.panels = null
        return
      }

      const panels_ = []
      for (const { id, name, help, sections } of data.config_panel.panel) {
        const panel_ = { id, name, sections: [] }
        if (help) panel_.help = formatI18nField(help)
        for (const { name, help, options } of sections) {
          const section_ = { name }
          if (help) section_.help = formatI18nField(help)
          section_.args = options.map(option => formatYunoHostArgument(option))
          panel_.sections.push(section_)
        }
        panels_.push(panel_)
      }
      this.panels = panels_
    },

    applyConfig () {
      // FIXME not tested
      const args = {}
      for (const panel of this.panels) {
        for (const section of panel.sections) {
          for (const arg of section.args) {
            if (arg.component === 'CheckboxItem') {
              args[arg.props.id] = arg.props.value ? 1 : 0
            } else {
              args[arg.props.id] = arg.props.value
            }
          }
        }
      }

      // FIXME not tested at all, route is currently broken
      api.post(`apps/${this.id}/config`, { args: objectToParams(args) }).then(response => {
        console.log('SUCCESS', response)
      }).catch(err => {
        console.log('ERROR', err)
      })
    }
  }
}
</script>
