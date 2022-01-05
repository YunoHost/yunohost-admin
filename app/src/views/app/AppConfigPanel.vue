<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" skeleton="card-form-skeleton">
    <template v-if="panels" #default>
      <b-tabs pills card vertical>
        <b-tab v-for="{ name, id: id_, sections, help, serverError } in panels"
               :key="id_"
               :title="name"
        >
          <template #title>
            <icon iname="wrench" /> {{ name }}
          </template>
          <card-form
            :key="id_"
            :title="name" icon="wrench" title-tag="h2"
            :validation="$v.forms[id_]" :id="id_ + '-form'" :server-error="serverError"
            @submit.prevent="applyConfig(id_)"
          >
            <template v-if="help" #disclaimer>
              <div class="alert alert-info" v-html="help" />
            </template>

            <template v-for="section in sections">
              <div :key="section.id" class="mb-5" v-if="isVisible(section.visible, section)">
                <b-card-title v-if="section.name" title-tag="h3">
                  {{ section.name }} <small v-if="section.help">{{ section.help }}</small>
                </b-card-title>
                <template v-for="(field, fname) in section.fields">
                  <form-field :key="fname" v-model="forms[id_][fname]"
                              :validation="$v.forms[id_][fname]"
                              v-if="isVisible(field.visible, field)" v-bind="field"
                  />
                </template>
              </div>
            </template>
          </card-form>
        </b-tab>
      </b-tabs>
    </template>

    <!-- if no config panel -->
    <b-alert v-else-if="panels === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_config_panel_no_panel') }}
    </b-alert>
  </view-base>
</template>

<script>
import { validationMixin } from 'vuelidate'
import evaluate from 'simple-evaluate'

// FIXME needs test and rework
import api, { objectToParams } from '@/api'
import { formatI18nField, formatYunoHostArguments, formatFormData, pFileReader } from '@/helpers/yunohostArguments'

export default {
  name: 'AppConfigPanel',

  mixins: [validationMixin],

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `apps/${this.id}/config-panel?full`],
        ['GET', { uri: 'domains' }],
        ['GET', { uri: 'domains/main', storeKey: 'main_domain' }],
        ['GET', { uri: 'users' }]
      ],
      panels: undefined,
      forms: undefined,
      errors: undefined,
      validations: null
    }
  },

  validations () {
    return this.validations
  },

  methods: {
    isVisible (expression, field) {
      if (!expression || !field) return true
      const context = {}

      const promises = []
      for (const args of Object.values(this.forms)) {
        for (const shortname in args) {
          if (args[shortname] instanceof File) {
            if (expression.includes(shortname)) {
              promises.push(pFileReader(args[shortname], context, shortname, false))
            }
          } else {
            context[shortname] = args[shortname]
          }
        }
      }
      // Allow to use match(var,regexp) function
      const matchRe = new RegExp('match\\(\\s*(\\w+)\\s*,\\s*"([^"]+)"\\s*\\)', 'g')
      let i = 0
      Promise.all(promises).then((value) => {
        for (const matched of expression.matchAll(matchRe)) {
            i++
            const varName = matched[1] + '__re' + i.toString()
            context[varName] = new RegExp(matched[2], 'm').test(context[matched[1]])
            expression = expression.replace(matched[0], varName)
        }

        try {
            field.isVisible = evaluate(context, expression)
        } catch (error) {
            field.isVisible = false
        }
      })
      // This value should be updated magically when vuejs will detect isVisible changed
      return field.isVisible
    },
    onQueriesResponse (data) {
      if (!data.panels || data.panels.length === 0) {
        this.panels = null
        return
      }

      const forms = {}
      const validations_ = {}
      const errors_ = {}
      const panels_ = []
      for (const { id, name, help, sections } of data.panels) {
        const panel_ = { id, sections: [] }
        if (name) panel_.name = formatI18nField(name)
        if (help) panel_.help = formatI18nField(help)
        forms[id] = {}
        validations_[id] = {}
        errors_[id] = {}
        for (const { id_, name, help, visible, options } of sections) {
          const section_ = { id: id_, isVisible: true, visible }
          if (help) section_.help = formatI18nField(help)
          if (name) section_.name = formatI18nField(name)
          const { form, fields, validations, errors } = formatYunoHostArguments(options)
          Object.assign(forms[id], form)
          Object.assign(validations_[id], validations)
          Object.assign(errors_[id], errors)
          section_.fields = fields
          panel_.sections.push(section_)
        }
        panels_.push(panel_)
      }

      this.forms = forms
      this.validations = { forms: validations_ }
      this.panels = panels_
      this.errors = errors_
    },

    applyConfig (id_) {
      formatFormData(this.forms[id_], { removeEmpty: false, removeNull: true, multipart: false }).then((formatedData) => {
        const args = objectToParams(formatedData)

        api.put(
          `apps/${this.id}/config`, { key: id_, args }, { key: 'apps.update_config', name: this.id }
        ).then(response => {
            api.get(
              `apps/${this.id}/config-panel?full`, {}, { key: 'apps.get_config', name: this.id }
            ).then(response => {
              this.onQueriesResponse(response)
            }).catch(err => {
                if (err.name !== 'APIBadRequestError') throw err
                const panel = this.panels.find(({ id }) => id_ === id)
                this.$set(panel, 'serverError', err.message)
            })
        }).catch(err => {
          if (err.name !== 'APIBadRequestError') throw err
          const panel = this.panels.find(({ id }) => id_ === id)
          if (err.data.name) {
            this.errors[id_][err.data.name].message = err.message
          } else this.$set(panel, 'serverError', err.message)
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
h3 {
  margin-bottom: 1em;
  border-bottom: solid 1px #aaa;
}
</style>
