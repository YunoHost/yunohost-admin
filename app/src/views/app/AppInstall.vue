<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse">
    <template v-if="app">
      <card :title="app.name" icon="download" body-class="p-0">
        <section class="p-3">
          <p v-if="app.alternativeTo" class="mt-3">
            <strong v-t="'app.potential_alternative_to'" />
            {{ app.alternativeTo }}
          </p>

          <vue-showdown :markdown="app.description" flavor="github" />

          <b-img
            v-if="app.image"
            :src="app.image"
            aria-hidden="true" class="d-block mb-3" fluid
          />

          <p>{{ $t('app.install.version', { version: app.version }) }}</p>

          <b-button
            v-if="app.demo"
            :href="app.demo" variant="primary" target="_blank"
          >
            <icon iname="external-link" />
            {{ $t('app.install.try_demo') }}
          </b-button>
        </section>

        <card-collapse id="app-integration" :title="$t('app.integration.title')" flush>
          <b-list-group flush tag="section">
            <yuno-list-group-item variant="info">
              {{ $t('app.integration.archs') }} {{ app.integration.archs }}
            </yuno-list-group-item>
            <yuno-list-group-item v-if="app.integration.ldap" :variant="app.integration.ldap === true ? 'success' : 'warning'">
              {{ $t(`app.integration.ldap.${app.integration.ldap}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item v-if="app.integration.sso" :variant="app.integration.sso === true ? 'success' : 'warning'">
              {{ $t(`app.integration.sso.${app.integration.sso}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item variant="info">
              {{ $t(`app.integration.multi_instance.${app.integration.multi_instance}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item variant="info">
              {{ $t('app.integration.resources', app.integration.resources) }}
            </yuno-list-group-item>
          </b-list-group>
        </card-collapse>

        <card-collapse id="app-links" :title="$t('app.links.title')" flush>
          <b-list-group flush tag="section">
            <yuno-list-group-item v-for="[key, link] in app.links" :key="key" no-status>
              <b-link :href="link" target="_blank">
                {{ $t('app.links.' + key) }}
              </b-link>
            </yuno-list-group-item>
          </b-list-group>
        </card-collapse>
      </card>

      <!-- INSTALL FORM -->
      <card-form
        :title="$t('app_install_parameters')" icon="cog" :submit-text="$t('install')"
        :validation="$v" :server-error="serverError"
        @submit.prevent="performInstall"
      >
        <template v-for="(field, fname) in fields">
          <component
            v-if="field.visible" :is="field.is" v-bind="field.props"
            v-model="form[fname]" :validation="$v.form[fname]" :key="fname"
          />
        </template>
      </card-form>
    </template>

    <!-- In case of a custom url with no manifest found -->
    <b-alert v-else-if="app === null" variant="warning">
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
import CardCollapse from '@/components/CardCollapse'

export default {
  name: 'AppInstall',

  mixins: [validationMixin],

  components: {
    CardCollapse
  },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', 'apps/manifest?app=' + this.id]
      ],
      app: undefined,
      name: undefined,
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
    onQueriesResponse (_app) {
      const { id, name, version } = _app
      const _archs = _app.integration.architectures

      const app = {
        id,
        name,
        alternativeTo: _app.potential_alternative_to && _app.potential_alternative_to.length
          ? _app.potential_alternative_to.join(this.$i18n.t('words.separator'))
          : null,
        description: formatI18nField(_app.doc.DESCRIPTION || _app.description),
        image: _app.image,
        demo: _app.upstream.demo,
        version,
        integration: {
          archs: Array.isArray(_archs) ? _archs.join(this.$i18n.t('words.separator')) : _archs,
          ldap: _app.integration.ldap === 'not_relevant' ? null : _app.integration.ldap,
          sso: _app.integration.sso === 'not_relevant' ? null : _app.integration.sso,
          multi_instance: _app.integration.multi_instance,
          resources: { ram: _app.integration.ram.runtime, disk: _app.integration.disk }
        },
        links: [
          ...['website', 'admindoc', 'code'].map((key) => ([key, _app.upstream[key]])),
          ['package', _app.remote.url],
          ['forum', `https://forum.yunohost.org/tag/${id}`]
        ].filter(([key, val]) => !!val)
      }

      // FIXME yunohost should add the label field by default
      _app.install.unshift({
        ask: this.$t('label_for_manifestname', { name }),
        default: name,
        name: 'label',
        help: this.$t('label_for_manifestname_help')
      })

      const {
        form,
        fields,
        validations,
        errors
      } = formatYunoHostArguments(_app.install)

      this.app = app
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

      api.post('apps', data, { key: 'apps.install', name: this.app.name }).then(() => {
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
