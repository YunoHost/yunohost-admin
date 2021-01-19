<template>
  <view-base :loading="loading">
    <template v-if="infos">
      <!-- BASIC INFOS -->
      <card :title="`${$t('infos')} — ${name}`" icon="info-circle">
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
        :title="$t('operations')" icon="wrench" :submit-text="$t('install')"
        :validation="$v" :server-error="serverError"
        @submit.prevent="performInstall"
      >
        <template v-if="formDisclaimer" #disclaimer>
          <div class="alert alert-info" v-html="formDisclaimer" />
        </template>

        <form-field
          v-for="(field, fname) in fields" :key="fname" label-cols="0"
          v-bind="field" v-model="form[fname]" :validation="$v.form[fname]"
        />
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

import api from '@/api'
import { objectToParams } from '@/helpers/commons'
import { formatYunoHostArguments, formatI18nField, formatFormData } from '@/helpers/yunohostArguments'

export default {
  name: 'AppInstall',

  mixins: [validationMixin],

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      loading: true,
      name: undefined,
      infos: undefined,
      formDisclaimer: null,
      form: undefined,
      fields: undefined,
      validations: null,
      serverError: ''
    }
  },

  validations () {
    return this.validations
  },

  methods: {
    getExternalManifest () {
      const url = this.id.replace('github.com', 'raw.githubusercontent.com') + 'master/manifest.json'
      return fetch(url).then(response => {
        if (response.ok) return response.json()
        else {
          throw Error('No manifest found at ' + url)
        }
      }).catch(() => {
        this.infos = null
      })
    },

    getApiManifest () {
      return api.get('appscatalog?full').then(response => response.apps[this.id].manifest)
    },

    formatManifestData (manifest) {
      this.name = manifest.name
      const infosKeys = ['id', 'description', 'license', 'version', 'multi_instance']
      if (manifest.license === undefined || manifest.license === 'free') {
        infosKeys.splice(2, 1)
      }
      manifest.description = formatI18nField(manifest.description)
      manifest.multi_instance = this.$i18n.t(manifest.multi_instance ? 'yes' : 'no')
      this.infos = Object.fromEntries(infosKeys.map(key => [key, manifest[key]]))

      const { form, fields, validations, disclaimer } = formatYunoHostArguments(
        manifest.arguments.install,
        manifest.name
      )

      this.formDisclaimer = disclaimer
      this.fields = fields
      this.form = form
      this.validations = { form: validations }
      this.loading = false
    },

    async performInstall () {
      if ('path' in this.form && this.form.path === '/') {
        const confirmed = await this.$askConfirmation(
          this.$i18n.t('confirm_install_domain_root', { domain: this.form.domain })
        )
        if (!confirmed) return
      }

      const { data: args, label } = formatFormData(this.form, { extract: ['label'] })
      const data = { app: this.id, label, args: objectToParams(args) }

      api.post('apps', data).then(response => {
        this.$router.push({ name: 'app-list' })
      }).catch(err => {
        this.serverError = err.message
      })
    }
  },

  created () {
    const isCustom = this.$route.name === 'app-install-custom'
    Promise.all([
      isCustom ? this.getExternalManifest() : this.getApiManifest(),
      this.$store.dispatch('FETCH_ALL', [
        { uri: 'domains' },
        { uri: 'domains/main', storeKey: 'main_domain' },
        { uri: 'users' }
      ])
    ]).then((responses) => this.formatManifestData(responses[0]))
  }
}
</script>
