<template>
  <div class="app-actions">
    <div v-if="actions">
      <b-alert variant="warning" show class="mb-4">
        <icon iname="exclamation-triangle" /> {{ $t('experimental_warning') }}
      </b-alert>

      <!-- BASIC INFOS -->
      <b-card v-for="(action, i) in actions" :key="i">
        <template v-slot:header>
          <h4>{{ action.name }}</h4>
        </template>

        <b-card-text v-if="action.description" v-html="action.description" />

        <b-form v-if="action.args" :id="action.id + '-form'" @submit.prevent="performAction(action)">
          <form-item-helper v-for="arg in action.args" :key="arg.name" v-bind="arg" />

          <b-form-invalid-feedback :id="action.id + '-feedback'" :state="action.isValid">
            {{ action.error }}
          </b-form-invalid-feedback>
        </b-form>

        <template v-slot:footer>
          <b-button
            v-if="action.args" type="submit" :form="action.id + '-form'"
            variant="success" class="ml-auto" v-t="'perform'"
          />
          <b-button
            v-else @click="performAction(action)"
            variant="success" class="ml-auto" v-t="'perform'"
          />
        </template>
      </b-card>
    </div>

    <!-- In case of a custom url with no manifest found -->
    <b-alert v-else-if="actions === null" variant="warning" show>
      <icon iname="exclamation-triangle" /> {{ $t('app_no_actions') }}
    </b-alert>
  </div>
</template>

<script>
import api, { objectToParams } from '@/helpers/api'
import { formatI18nField, formatYunoHostArgument } from '@/helpers/yunohostArguments'

export default {
  name: 'AppActions',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      actions: undefined
    }
  },

  methods: {
    fetchData () {
      Promise.all([
        api.get(`apps/${this.id}/actions`),
        this.$store.dispatch('FETCH_ALL', [
          { uri: 'domains' },
          { uri: 'domains/main', storeKey: 'main_domain' },
          { uri: 'users' }
        ])
      ]).then((responses) => this.setupForm(responses[0]))
    },

    setupForm (data) {
      if (!data.actions) {
        this.actions = null
        return
      }

      const actions = []
      for (const { name, id, description, arguments: arguments_ } of data.actions) {
        const action = { name, id, isValid: null, error: '' }
        if (description) {
          action.description = formatI18nField(description)
        }
        if (arguments_ && arguments_.length) {
          action.args = arguments_.map(arg => formatYunoHostArgument(arg))
        }
        actions.push(action)
      }
      this.actions = actions
    },

    performAction (action) {
      const data = {}

      if (action.args) {
        const args = {}
        for (const arg of action.args) {
          if (arg.component === 'CheckboxItem') {
            args[arg.props.id] = arg.props.value ? 1 : 0
          } else {
            args[arg.props.id] = arg.props.value
          }
        }
        data.args = objectToParams(args)
      // FIXME api expect at least one argument ?!
      } else {
        data.args = objectToParams({ wut: undefined })
      }

      api.put(`apps/${this.id}/actions/${action.id}`, data).then(response => {
        this.fetchData()
      }).catch(err => {
        action.isValid = false
        action.error = err.message
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>

<style>

</style>
