<template>
  <div class="app-install">
    <div v-if="infos">
      <!-- BASIC INFOS -->
      <b-card>
        <template v-slot:header>
          <h2><icon iname="info-circle" /> {{ $t('infos') }} — {{ name }}</h2>
        </template>

        <b-row
          v-for="key in infosKeys" :key="key"
          no-gutters class="row-line"
        >
          <b-col cols="5" md="3" xl="3">
            <strong>{{ $t(key) }}</strong>
            <span class="sep" />
          </b-col>
          <b-col>
            <span>{{ infos[key] }}</span>
          </b-col>
        </b-row>
      </b-card>

      <!-- INSTALL FORM -->
      <b-card>
        <template v-slot:header>
          <h2><icon iname="wrench" /> {{ $t('operations') }}</h2>
        </template>

        <b-form id="install-form" @submit.prevent="beforeInstall">
          <form-item-helper v-bind="form.label" />
          <form-item-helper v-for="arg in form.args" :key="arg.name" v-bind="arg" />

          <b-form-invalid-feedback id="global-feedback" :state="server.isValid">
            {{ server.error }}
          </b-form-invalid-feedback>
        </b-form>

        <template v-slot:footer>
          <b-button
            class="ml-auto"
            type="submit" form="install-form"
            variant="success" v-t="'install'"
          />
        </template>
      </b-card>

      <!-- CONFIRM INSTALL DOMAIN ROOT MODAL -->
      <b-modal
        id="confirm-domain-root-modal" ref="confirm-domain-root-modal" centered
        body-bg-variant="danger" body-text-variant="light"
        @ok="performInstall" hide-header
        :ok-title="$t('install')"
      >
        {{ $t('confirm_install_domain_root', { domain: confirmDomain }) }}
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
import { formatYunoHostArgument } from '@/helpers/yunohostArguments'
import { objectToParams } from '@/helpers/commons'

export default {
  name: 'AppInstall',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      name: undefined,
      infosKeys: ['id', 'description', 'license', 'version', 'multi_instance'],
      infos: undefined,
      form: undefined,
      server: {
        isValid: null,
        error: ''
      },
      confirmDomain: null
    }
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
      if (manifest.license === undefined || manifest.license === 'free') {
        this.infosKeys.splice(2, 1)
      }
      const desc = manifest.description
      if (typeof desc !== 'string') {
        manifest.description = desc[this.$i18n.locale] || desc.en
      }
      manifest.multi_instance = this.$i18n.t(manifest.multi_instance ? 'yes' : 'no')

      const infos = {}
      for (const key of this.infosKeys) {
        infos[key] = manifest[key]
      }
      this.infos = infos
      this.name = manifest.name

      this.form = {
        label: formatYunoHostArgument({
          ask: this.$i18n.t('label_for_manifestname', { name: manifest.name }),
          default: manifest.name,
          name: 'label'
        }),
        args: manifest.arguments.install.map(arg => formatYunoHostArgument(arg))
      }
    },

    beforeInstall () {
      const path = this.form.args.find(arg => arg.props.id === 'path')
      if (path && path.props.value === '/') {
        this.confirmDomain = this.form.args.find(arg => arg.props.id === 'domain').props.value
        this.$refs['confirm-domain-root-modal'].show()
      } else {
        this.performInstall()
      }
    },

    performInstall () {
      const args = {}
      for (const arg of this.form.args) {
        if (arg.component === 'CheckboxItem') {
          args[arg.props.id] = arg.props.value ? 1 : 0
        } else {
          args[arg.props.id] = arg.props.value
        }
      }
      const data = {
        app: this.id,
        label: this.form.label.props.value,
        args: objectToParams(args)
      }

      api.post('apps', data).then(response => {
        this.$router.push({ name: 'app-list' })
      }).catch(err => {
        this.server.isValid = false
        this.server.error = err.message
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
