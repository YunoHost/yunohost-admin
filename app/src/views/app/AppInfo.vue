<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" ref="view">
    <!-- BASIC INFOS -->
    <card v-if="infos" :title="infos.label" icon="cube">
      <template #header-buttons>
        <b-button @click="uninstall" id="uninstall" variant="danger">
          <icon iname="trash-o" /> {{ $t('uninstall') }}
        </b-button>
      </template>

      <description-row
        v-for="(value, key) in infos" :key="key"
        :term="$t(key)"
      >
        <a v-if="key === 'url'" :href="value" target="_blank">{{ value }}</a>
        <template v-else>{{ value }}</template>
      </description-row>
      <description-row :term="$t('app_info_access_desc')">
        {{ allowedGroups.length > 0 ? allowedGroups.join(', ') + '.' : $t('nobody') }}
        <b-button
          size="sm" :to="{ name: 'group-list'}" variant="info"
          class="ml-2"
        >
          <icon iname="key-modern" /> {{ $t('groups_and_permissions_manage') }}
        </b-button>
      </description-row>

      <template #footer>
        <b-card-text class="text-warning">
          {{ $t('app.info.problem') }}
          <b-link :href="`https://forum.yunohost.org/tag/${id}`" target="_blank">
            {{ $t('app.info.forum') }}
          </b-link>
        </b-card-text>
      </template>
    </card>

    <config-panels v-bind="config" @submit="onConfigSubmit">
      <!-- OPERATIONS TAB -->
      <template v-if="currentTab === 'operations'" #tab-top>
        <!-- CHANGE PERMISSIONS LABEL -->
        <b-form-group :label="$t('app_manage_label_and_tiles')" label-class="font-weight-bold">
          <form-field
            v-for="(perm, i) in app.permissions" :key="i"
            :label="perm.title" :label-for="'perm-' + i"
            label-cols="0" label-class="" class="m-0"
            :validation="$v.form.labels.$each[i] "
          >
            <template #default="{ self }">
              <b-input-group>
                <input-item
                  :state="self.state" v-model="form.labels[i].label"
                  :id="'perm' + i" :aria-describedby="'perm-' + i + '_group__BV_description_'"
                />
                <b-input-group-append v-if="perm.tileAvailable" is-text>
                  <checkbox-item v-model="form.labels[i].show_tile" :label="$t('permission_show_tile_enabled')" />
                </b-input-group-append>
                <b-input-group-append>
                  <b-button
                    variant="info" v-t="'save'"
                    @click="changeLabel(perm.name, form.labels[i])"
                  />
                </b-input-group-append>
              </b-input-group>
            </template>

            <template v-if="perm.url" #description>
              {{ $t('permission_corresponding_url') }}:
              <b-link :href="'https://' + perm.url">
                https://{{ perm.url }}
              </b-link>
            </template>
          </form-field>
        </b-form-group>
        <hr>

        <!-- CHANGE URL -->
        <b-form-group
          :label="$t('app_info_changeurl_desc')" label-for="input-url"
          :label-cols-lg="app.supports_change_url ? 0 : 0" label-class="font-weight-bold"
          v-if="app.is_webapp"
        >
          <b-input-group v-if="app.supports_change_url">
            <b-input-group-prepend is-text>
              https://
            </b-input-group-prepend>

            <b-input-group-prepend class="flex-grow-1">
              <b-select v-model="form.url.domain" :options="domains" />
            </b-input-group-prepend>

            <b-input-group-prepend is-text>
              /
            </b-input-group-prepend>

            <b-input id="input-url" v-model="form.url.path" class="flex-grow-3" />

            <b-input-group-append>
              <b-button @click="changeUrl" variant="info" v-t="'save'" />
            </b-input-group-append>
          </b-input-group>

          <div v-else class="alert alert-warning">
            <icon iname="exclamation" /> {{ $t('app_info_change_url_disabled_tooltip') }}
          </div>
        </b-form-group>
        <hr v-if="app.is_webapp">

        <!-- MAKE DEFAULT -->
        <b-form-group
          :label="$t('app_info_default_desc', { domain: app.domain })" label-for="main-domain"
          label-class="font-weight-bold" label-cols-md="4"
          v-if="app.is_webapp"
        >
          <template v-if="!app.is_default">
            <b-button @click="setAsDefaultDomain($event, false)" id="main-domain" variant="success">
              <icon iname="star" /> {{ $t('app_make_default') }}
            </b-button>
          </template>

          <template v-else>
            <b-button @click="setAsDefaultDomain($event, true)" id="main-domain" variant="warning">
              <icon iname="star" /> {{ $t('app_make_not_default') }}
            </b-button>
          </template>
        </b-form-group>
      </template>
    </config-panels>

    <b-card v-if="doc" no-body>
      <b-tabs card fill pills>
        <b-tab :title="$t('app.doc.notifications.title')" active>
          <section v-if="doc.notifications.postUpgrade.length">
            <b-card-title title-tag="h3" v-t="'app.doc.notifications.post_upgrade'" />

            <div
              v-for="[name, notif] in doc.notifications.postUpgrade" :key="name"
            >
              <b-card-title v-if="name !== 'main'">
                {{ name }}
              </b-card-title>
              <vue-showdown :markdown="notif" flavor="github" />
            </div>
          </section>

          <section v-if="doc.notifications.postInstall.length">
            <b-card-title title-tag="h3">
              {{ $t('app.doc.notifications.post_install') }}
            </b-card-title>

            <div
              v-for="[name, notif] in doc.notifications.postInstall" :key="name"
            >
              <b-card-title tag="h5" v-if="name !== 'main'">
                {{ name }}
              </b-card-title>
              <vue-showdown :markdown="notif" flavor="github" />
            </div>
          </section>
        </b-tab>

        <b-tab :title="$t('app.doc.admin.title')">
          {{ doc.admin.links }}
          <vue-showdown :markdown="doc.admin.content" flavor="github" />
        </b-tab>

        <b-tab :title="$t('app.doc.about.title')" no-body>
          <section class="p-3">
            <b-card-title>{{ $t('app.doc.about.description') }}</b-card-title>

            <p v-if="doc.about.alternativeTo">
              <strong v-t="'app.potential_alternative_to'" />
              {{ doc.about.alternativeTo }}
            </p>

            <vue-showdown :markdown="doc.about.description" flavor="github" />

            <p>
              {{ $t('app.install.license', { license: doc.about.license }) }}
            </p>
          </section>

          <card-collapse
            id="app-integration" :title="$t('app.integration.title')"
            flush visible
          >
            <b-list-group flush tag="section">
              <yuno-list-group-item variant="info">
                {{ $t('app.integration.archs') }} {{ doc.about.integration.archs }}
              </yuno-list-group-item>
              <yuno-list-group-item v-if="doc.about.integration.ldap" :variant="doc.about.integration.ldap === true ? 'success' : 'warning'">
                {{ $t(`app.integration.ldap.${doc.about.integration.ldap}`) }}
              </yuno-list-group-item>
              <yuno-list-group-item v-if="doc.about.integration.sso" :variant="doc.about.integration.sso === true ? 'success' : 'warning'">
                {{ $t(`app.integration.sso.${doc.about.integration.sso}`) }}
              </yuno-list-group-item>
              <yuno-list-group-item variant="info">
                {{ $t(`app.integration.multi_instance.${doc.about.integration.multi_instance}`) }}
              </yuno-list-group-item>
              <yuno-list-group-item variant="info">
                {{ $t('app.integration.resources', doc.about.integration.resources) }}
              </yuno-list-group-item>
            </b-list-group>
          </card-collapse>

          <card-collapse
            id="app-links" :title="$t('app.links.title')"
            flush visible
          >
            <b-list-group flush tag="section">
              <yuno-list-group-item v-for="[key, link] in doc.about.links" :key="key" no-status>
                <b-link :href="link" target="_blank">
                  {{ $t('app.links.' + key) }}
                </b-link>
              </yuno-list-group-item>
            </b-list-group>
          </card-collapse>
        </b-tab>
      </b-tabs>
    </b-card>

    <template #skeleton>
      <card-info-skeleton :item-count="8" />
      <card-form-skeleton />
    </template>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import api, { objectToParams } from '@/api'
import { readableDate } from '@/helpers/filters/date'
import { humanPermissionName } from '@/helpers/filters/human'
import { required } from '@/helpers/validators'
import {
  formatFormData,
  formatI18nField,
  formatYunoHostConfigPanels
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels'
import CardCollapse from '@/components/CardCollapse'

export default {
  name: 'AppInfo',

  components: {
    CardCollapse,
    ConfigPanels
  },

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `apps/${this.id}?full`],
        ['GET', { uri: 'users/permissions?full', storeKey: 'permissions' }],
        ['GET', { uri: 'domains' }],
        ['GET', `apps/${this.id}/config?full`]
      ],
      infos: undefined,
      app: undefined,
      form: undefined,
      config: {
        panels: [
          // Fake integration of operations in config panels
          {
            hasApplyButton: false,
            id: 'operations',
            name: this.$i18n.t('operations')
          }
        ],
        validations: {}
      },
      doc: undefined
    }
  },

  computed: {
    ...mapGetters(['domains']),

    currentTab () {
      return this.$route.params.tabId
    },

    allowedGroups () {
      if (!this.app) return
      return this.app.permissions[0].allowed
    }
  },

  validations () {
    return {
      form: {
        labels: {
          $each: { label: { required } }
        },
        url: { path: { required } }
      }
    }
  },

  methods: {
    onQueriesResponse (app, _, __, config) {
      if (app.supports_config_panel) {
        const config_ = formatYunoHostConfigPanels(config)
        // reinject 'operations' fake config tab
        config_.panels.unshift(this.config.panels[0])
        this.config = config_
      }

      const form = { labels: [] }

      const mainPermission = app.permissions[this.id + '.main']
      mainPermission.name = this.id + '.main'
      mainPermission.title = this.$i18n.t('permission_main')
      mainPermission.tileAvailable = mainPermission.url !== null && !mainPermission.url.startsWith('re:')
      form.labels.push({ label: mainPermission.label, show_tile: mainPermission.show_tile })

      const permissions = [mainPermission]
      for (const [name, perm] of Object.entries(app.permissions)) {
        if (!name.endsWith('.main')) {
          permissions.push({
            ...perm,
            name,
            label: perm.sublabel,
            title: humanPermissionName(name),
            tileAvailable: perm.url !== null && !perm.url.startsWith('re:')
          })
          form.labels.push({ label: perm.sublabel, show_tile: perm.show_tile })
        }
      }

      this.infos = {
        id: this.id,
        label: mainPermission.label,
        description: app.description,
        version: app.version,
        install_time: readableDate(app.settings.install_time, true, true)
      }
      if (app.settings.domain && app.settings.path) {
        this.infos.url = 'https://' + app.settings.domain + app.settings.path
        form.url = {
          domain: app.settings.domain,
          path: app.settings.path.slice(1)
        }
      }

      this.form = form
      this.app = {
        domain: app.settings.domain,
        is_webapp: app.is_webapp,
        is_default: app.is_default,
        supports_change_url: app.supports_change_url,
        supports_config_panel: app.supports_config_panel,
        permissions
      }

      const notifs = app.manifest.notifications
      const { DESCRIPTION, ADMIN, ...doc } = app.manifest.doc
      const { ldap, sso, multi_instance, ram, disk, architectures: archs } = app.manifest.integration
      this.doc = {
        notifications: {
          postInstall: [['main', formatI18nField(notifs.post_install.main)]],
          postUpgrade: Object.entries(notifs.post_upgrade).map(([key, content]) => {
            return [key, formatI18nField(content)]
          })
        },
        admin: {
          content: [
            formatI18nField(ADMIN),
            ...Object.keys(doc).sort().map((key) => formatI18nField(doc[key]))
          ].join('\n\n')
        },
        about: {
          alternativeTo: app.from_catalog.potential_alternative_to.length
            ? app.from_catalog.potential_alternative_to.join(this.$i18n.t('words.separator'))
            : null,
          description: formatI18nField(DESCRIPTION),
          license: app.manifest.upstream.license,
          integration: {
            archs: Array.isArray(archs) ? archs.join(this.$i18n.t('words.separator')) : archs,
            ldap: ldap === 'not_relevant' ? null : ldap,
            sso: sso === 'not_relevant' ? null : sso,
            multi_instance,
            resources: { ram: ram.runtime, disk }
          },
          links: [
            ...['website', 'admindoc', 'userdoc', 'code'].map((key) => ([key, app.manifest.upstream[key]])),
            ['forum', `https://forum.yunohost.org/tag/${this.id}`]
          ].filter(([key, val]) => !!val)
        }
      }

      if (this.app.is_webapp) {
        this.app.is_default = app.is_default
      }
    },

    async onConfigSubmit ({ id, form, action, name }) {
      const args = await formatFormData(form, { removeEmpty: false, removeNull: true })

      api.put(
        action
          ? `apps/${this.id}/actions/${action}`
          : `apps/${this.id}/config/${id}`,
        { args: objectToParams(args) },
        { key: `apps.${action ? 'action' : 'update'}_config`, id, name: this.id }
      ).then(() => {
        this.$refs.view.fetchQueries({ triggerLoading: true })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.config.panels.find(panel => panel.id === id)
        if (err.data.name) {
          this.config.errors[id][err.data.name].message = err.message
        } else this.$set(panel, 'serverError', err.message)
      })
    },

    changeLabel (permName, data) {
      data.show_tile = data.show_tile ? 'True' : 'False'
      api.put(
        'users/permissions/' + permName,
        data,
        { key: 'apps.change_label', prevName: this.infos.label, nextName: data.label }
      ).then(this.$refs.view.fetchQueries)
    },

    async changeUrl () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_app_change_url'))
      if (!confirmed) return

      const { domain, path } = this.form.url
      api.put(
        `apps/${this.id}/changeurl`,
        { domain, path: '/' + path },
        { key: 'apps.change_url', name: this.infos.label }
      ).then(this.$refs.view.fetchQueries)
    },

    async setAsDefaultDomain (event, undo = false) {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_app_default'))
      if (!confirmed) return

      api.put(
        `apps/${this.id}/default${undo ? '?undo' : ''}`,
        {},
        { key: 'apps.set_default', name: this.infos.label, domain: this.app.domain }
      ).then(this.$refs.view.fetchQueries)
    },

    async uninstall () {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_uninstall', { name: this.id })
      )
      if (!confirmed) return

      api.delete('apps/' + this.id, {}, { key: 'apps.uninstall', name: this.infos.label }).then(() => {
        this.$router.push({ name: 'app-list' })
      })
    }
  },

  filters: { readableDate },
  mixins: [validationMixin]
}
</script>

<style lang="scss" scoped>
select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group input {
  min-width: 5rem;
}
</style>
