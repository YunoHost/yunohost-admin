<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" skeleton="card-form-skeleton">
    <template v-if="panels" #default>
      <b-alert variant="warning" class="mb-4">
        <icon iname="exclamation-triangle" /> {{ $t('experimental_warning') }}
      </b-alert>

      <card-form
        v-for="{ name, id: id_, sections, help, serverError } in panels" :key="id_"
        :title="name" icon="wrench" title-tag="h4"
        :validation="$v.forms[id_]" :id="id_ + '-form'" :server-error="serverError"
        collapsable
        @submit.prevent="applyConfig(id_)"
      >
        <template v-if="help" #disclaimer>
          <div class="alert alert-info" v-html="help" />
        </template>

        <div v-for="section in sections" :key="section.id" class="mb-5">
          <b-card-title>{{ section.name }} <small v-if="section.help">{{ section.help }}</small></b-card-title>

          <form-field
            v-for="(field, fname) in section.fields" :key="fname" label-cols="0"
            v-bind="field" v-model="forms[id_][fname]" :validation="$v.forms[id_][fname]"
          />
        </div>
      </card-form>
    </template>

    <!-- if no config panel -->
    <b-alert v-else-if="panels === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_config_panel_no_panel') }}
    </b-alert>
  </view-base>
</template>

<script>
import { validationMixin } from 'vuelidate'

// FIXME needs test and rework
import api from '@/api'
import { formatI18nField, formatYunoHostArguments, formatFormData } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppConfigPanel',

  mixins: [validationMixin],

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `apps/${this.id}/config-panel`],
        ['GET', { uri: 'domains' }],
        ['GET', { uri: 'domains/main', storeKey: 'main_domain' }],
        ['GET', { uri: 'users' }]
      ],
      panels: undefined,
      forms: undefined,
      validations: null
    }
  },

  validations () {
    return this.validations
  },

  methods: {
    onQueriesResponse (data) {
      if (!data.config_panel || data.config_panel.length === 0) {
        this.panels = null
        return
      }

      const forms = {}
      const validations_ = {}
      const panels_ = []
      for (const { id, name, help, sections } of data.config_panel.panel) {
        const panel_ = { id, name, sections: [] }
        if (help) panel_.help = formatI18nField(help)
        forms[id] = {}
        validations_[id] = {}
        for (const { name, help, options } of sections) {
          const section_ = { name }
          if (help) section_.help = formatI18nField(help)
          const { form, fields, validations } = formatYunoHostArguments(options)
          Object.assign(forms[id], form)
          Object.assign(validations_[id], validations)
          panel_.sections.push({ name, fields })
        }
        panels_.push(panel_)
      }

      this.forms = forms
      this.validations = { forms: validations_ }
      this.panels = panels_
    },

    applyConfig (id_) {
      const args = objectToParams(formatFormData(this.forms[id_]))

      api.put(`apps/${this.id}/config`, { args }).then(response => {
        console.log('SUCCESS', response)
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.panels.find(({ id }) => id_ === id)
        this.$set(panel, 'serverError', err.message)
      })
    }
  }
}
</script>
