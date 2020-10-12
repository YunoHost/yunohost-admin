<template>
  <div class="app-config-panel">
    <div v-if="panels">
      <b-alert variant="warning" show class="mb-4">
        <icon iname="exclamation-triangle" /> {{ $t('experimental_warning') }}
      </b-alert>

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
    </div>

    <!-- if no config panel -->
    <b-alert v-else-if="panels === null" variant="warning" show>
      <icon iname="exclamation-triangle" /> {{ $t('app_config_panel_no_panel') }}
    </b-alert>
  </div>
</template>

<script>
// FIXME needs test and rework
import api from '@/api'
import { formatI18nField, formatYunoHostArgument } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppConfigPanel',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      panels: undefined
    }
  },

  methods: {
    fetchData () {
      Promise.all([
        api.get(`apps/${this.id}/config-panel`),
        this.$store.dispatch('FETCH_ALL', [
          { uri: 'domains' },
          { uri: 'domains/main', storeKey: 'main_domain' },
          { uri: 'users' }
        ])
      ]).then((responses) => this.setupForm(responses[0]))
    },

    setupForm (data) {
      if (!data.config_panel) {
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

      api.post(`apps/${this.id}/config`, { args: objectToParams(args) }).then(response => {
        console.log('SUCCESS', response)
      }).catch(err => {
        console.log('ERROR', err)
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
