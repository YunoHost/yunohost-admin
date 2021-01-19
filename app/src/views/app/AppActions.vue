<template>
  <view-base
    :queries="queries" @queries-response="formatAppActions"
    ref="view" skeleton="card-form-skeleton"
  >
    <template v-if="actions" #default>
      <b-alert variant="warning" class="mb-4">
        <icon iname="exclamation-triangle" /> {{ $t('experimental_warning') }}
      </b-alert>

      <!-- ACTIONS FORMS -->
      <card-form
        v-for="(action, i) in actions" :key="i"
        :title="action.name" icon="wrench" title-tag="h4"
        :validation="$v.actions[i]" :id="action.id + '-form'" :server-error="action.serverError"
        @submit.prevent="performAction(action)" :submit-text="$t('perform')"
      >
        <template #disclaimer>
          <div
            v-if="action.formDisclaimer"
            class="alert alert-info" v-html="action.formDisclaimer"
          />
          <b-card-text v-if="action.description" v-html="action.description" />
        </template>

        <form-field
          v-for="(field, fname) in action.fields" :key="fname" label-cols="0"
          v-bind="field" v-model="action.form[fname]" :validation="$v.actions[i][fname]"
        />
      </card-form>
    </template>

    <!-- In case of a custom url with no manifest found -->
    <b-alert v-else-if="actions === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_no_actions') }}
    </b-alert>
  </view-base>
</template>

<script>
import api from '@/api'
import { validationMixin } from 'vuelidate'

import { formatI18nField, formatYunoHostArguments, formatFormData } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppActions',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        `apps/${this.id}/actions`,
        { uri: 'domains' },
        { uri: 'domains/main', storeKey: 'main_domain' },
        { uri: 'users' }
      ],
      actions: undefined
    }
  },

  validations () {
    const validations = {}
    for (const [i, action] of this.actions.entries()) {
      if (action.validations) {
        validations[i] = { form: action.validations }
      }
    }
    return { actions: validations }
  },

  methods: {
    formatAppActions (data) {
      if (!data.actions) {
        this.actions = null
        return
      }

      this.actions = data.actions.map(({ name, id, description, arguments: arguments_ }) => {
        const action = { name, id, serverError: '' }
        if (description) action.description = formatI18nField(description)
        if (arguments_ && arguments_.length) {
          const { form, fields, validations, disclaimer } = formatYunoHostArguments(arguments_)
          action.form = form
          action.fields = fields
          if (validations) action.validations = validations
          if (disclaimer) action.formDisclaimer = disclaimer
        }
        return action
      })
    },

    performAction (action) {
      // FIXME api expects at least one argument ?! (fake one given with { wut } )
      const args = objectToParams(action.form ? formatFormData(action.form) : { wut: undefined })

      api.put(`apps/${this.id}/actions/${action.id}`, { args }).then(response => {
        this.$refs.view.fetchQueries()
      }).catch(error => {
        action.serverError = error.message
      })
    }
  },

  mixins: [validationMixin]
}
</script>
