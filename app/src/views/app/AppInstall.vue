<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse">
    <template v-if="infos">
      <!-- BASIC INFOS -->
      <card :title="name" icon="download">
        <b-row
          v-for="(info, key) in infos" :key="key"
          no-gutters class="row-line"
        >
          <b-col cols="5" md="3" xl="3">
            <strong>{{ $t(key) }}</strong>
            <span class="sep" />
          </b-col>
          <b-col>
            <span>{{ info }}</span>
          </b-col>
        </b-row>
      </card>

      <!-- INSTALL FORM -->
      <card-form
        :title="$t('app_install_parameters')" icon="cog" :submit-text="$t('install')"
        :validation="$v" :server-error="serverError"
        @submit.prevent="performInstall"
      >
        <template v-for="(field, fname) in fields">
          <form-field
            v-if="field.visible" :key="fname" label-cols="0"
            v-bind="field" v-model="form[fname]" :validation="$v.form[fname]"
          />
        </template>
      </card-form>
    </template>

    <!-- In case of a custom url with no manifest found -->
    <b-alert v-else-if="infos === null" variant="warning">
      <icon iname="exclamation-triangle" /> {{ $t('app_install_custom_no_manifest') }}
    </b-alert>

    <template #skeleton>
      <card-info-skeleton />
      <card-form-skeleton :cols="null" />
    </template>
  </view-base>
</template>

<script>
import { validationMixin } from 'vuelidate'

import api, { objectToParams } from '@/api'
import {
  formatYunoHostArguments,
  formatI18nField,
  formatFormData
} from '@/helpers/yunohostArguments'

export default {
  name: 'AppInstall',

  mixins: [validationMixin],

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', 'apps/manifest?app=' + this.id]
      ],
      name: undefined,
      infos: undefined,
      formDisclaimer: null,
      form: undefined,
      fields: undefined,
      validations: null,
      errors: undefined,
      serverError: ''
    }
  },

  validations () {
    return this.validations
  },

  methods: {
    onQueriesResponse (manifest) {
      this.name = manifest.name
      const infosKeys = ['id', 'description', 'license', 'version', 'multi_instance']
      if (manifest.license === undefined || manifest.license === 'free') {
        infosKeys.splice(2, 1)
      }
      manifest.description = formatI18nField(manifest.description)
      manifest.multi_instance = this.$i18n.t(manifest.multi_instance ? 'yes' : 'no')
      this.infos = Object.fromEntries(infosKeys.map(key => [key, manifest[key]]))

      // FIXME yunohost should add the label field by default
      manifest.arguments.install.unshift({
        ask: this.$t('label_for_manifestname', { name: manifest.name }),
        default: manifest.name,
        name: 'label'
      })

      const {
        form,
        fields,
        validations,
        errors
      } = formatYunoHostArguments(manifest.arguments.install)

      this.fields = fields
      this.form = form
      this.validations = { form: validations }
      this.errors = errors
    },

    async performInstall () {
      if ('path' in this.form && this.form.path === '/') {
        const confirmed = await this.$askConfirmation(
          this.$i18n.t('confirm_install_domain_root', { domain: this.form.domain })
        )
        if (!confirmed) return
      }

      const { data: args, label } = await formatFormData(
        this.form,
        { extract: ['label'], removeEmpty: false, removeNull: true }
      )
      const data = { app: this.id, label, args: Object.entries(args).length ? objectToParams(args) : undefined }

      api.post('apps', data, { key: 'apps.install', name: this.name }).then(() => {
        this.$router.push({ name: 'app-list' })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        if (err.data.name) {
          this.errors[err.data.name].message = err.message
        } else this.serverError = err.message
      })
    }
  }
}
</script>
