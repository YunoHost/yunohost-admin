<template>
  <div class="app-install">
    <div v-if="infos">
      <!-- BASIC INFOS -->
      <b-card>
        <template v-slot:header>
          <h2><icon iname="info-circle" /> {{ $t('infos') }} — {{ name }}</h2>
        </template>

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
      </b-card>

      <!-- INSTALL FORM -->
      <card-form
        :title="$t('operations')" icon="wrench" :submit-text="$t('install')"
        :validation="$v" :server-error="serverError"
        @submit.prevent="beforeInstall"
      >
        <template v-if="formDisclaimer" #disclaimer>
          <b-alert show variant="info" v-html="formDisclaimer" />
        </template>

        <form-field
          v-for="(field, fname) in fields" :key="fname" label-cols="0"
          v-bind="field" v-model="form[fname]" :validation="$v.form[fname]"
        />
      </card-form>

      <!-- CONFIRM INSTALL DOMAIN ROOT MODAL -->
      <b-modal
        id="confirm-domain-root-modal" ref="confirm-domain-root-modal" centered
        body-bg-variant="danger" body-text-variant="light"
        @ok="performInstall" hide-header
        :ok-title="$t('install')"
      >
        {{ $t('confirm_install_domain_root', { domain: this.form.domain }) }}
      </b-modal>
    </div>

    <!-- In case of a custom url with no manifest found -->
    <b-alert v-else-if="infos === null" variant="warning" show>
      <icon iname="exclamation-triangle" /> {{ $t('app_install_custom_no_manifest') }}
    </b-alert>
  </div>
</template>

<script>
import api from '@/api'
import { validationMixin } from 'vuelidate'
import { formatYunoHostArguments, formatI18nField, formatFormData } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppInstall',

  mixins: [validationMixin],

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
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

    fetchData () {
      const isCustom = this.$route.name === 'app-install-custom'
      Promise.all([
        isCustom ? this.getExternalManifest() : this.getApiManifest(),
        this.$store.dispatch('FETCH_ALL', [
          { uri: 'domains' },
          { uri: 'domains/main', storeKey: 'main_domain' },
          { uri: 'users' }
        ])
      ]).then((responses) => this.setupForm(responses[0]))
    },

    setupForm (manifest) {
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
    },

    beforeInstall () {
      if ('path' in this.form && this.form.path === '/') {
        this.$refs['confirm-domain-root-modal'].show()
      } else {
        this.performInstall()
      }
    },

    performInstall () {
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
    this.fetchData()
  }
}
</script>
