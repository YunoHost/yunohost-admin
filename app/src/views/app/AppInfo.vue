<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    :loading="loading"
    ref="view"
  >
    <YAlert
      v-if="
        app &&
        app.doc &&
        app.doc.notifications &&
        app.doc.notifications.postInstall.length
      "
      variant="info"
      class="my-4"
    >
      <div class="d-md-flex align-items-center mb-3">
        <h2 v-t="'app.doc.notifications.post_install'" class="md-m-0" />
        <BButton
          variant="primary"
          size="sm"
          class="ml-auto mr-2"
          @click="dismissNotification('post_install')"
        >
          <YIcon iname="check" />
          {{ $t('app.doc.notifications.understood') }}
        </BButton>
      </div>

      <VueShowdown
        v-for="[name, notif] in app.doc.notifications.postInstall"
        :key="name"
        :markdown="notif"
        :options="{ headerLevelStart: 4 }"
      />
    </YAlert>

    <YAlert
      v-if="
        app &&
        app.doc &&
        app.doc.notifications &&
        app.doc.notifications.postUpgrade.length
      "
      variant="info"
      class="my-4"
    >
      <div class="d-md-flex align-items-center mb-3">
        <h2 v-t="'app.doc.notifications.post_upgrade'" class="md-m-0" />
        <BButton
          variant="primary"
          size="sm"
          class="ml-auto mr-2"
          @click="dismissNotification('post_upgrade')"
        >
          <YIcon iname="check" />
          {{ $t('app.doc.notifications.understood') }}
        </BButton>
      </div>

      <VueShowdown
        v-for="[name, notif] in app.doc.notifications.postUpgrade"
        :key="name"
        :markdown="notif"
        :options="{ headerLevelStart: 4 }"
      />
    </YAlert>

    <section v-if="app" class="border rounded p-3 mb-4">
      <div class="d-md-flex align-items-center mb-4">
        <h1 class="mb-3 mb-md-0">
          <YIcon iname="cube" />
          {{ app.label }}

          <span class="text-secondary tiny">
            {{ app.id }}
          </span>
        </h1>

        <BButton
          v-if="app.url"
          :href="app.url"
          target="_blank"
          variant="success"
          class="ml-auto mr-2"
        >
          <YIcon iname="external-link" />
          {{ $t('app.open_this_app') }}
        </BButton>

        <BButton
          v-b-modal.uninstall-modal
          id="uninstall"
          variant="danger"
          :class="{ 'ml-auto': !app.url }"
        >
          <YIcon iname="trash-o" />
          {{ $t('uninstall') }}
        </BButton>
      </div>

      <p class="text-secondary">
        <strong v-t="'app.installed_version'" /> {{ app.version }}<br />

        <template v-if="app.alternativeTo">
          <strong v-t="'app.potential_alternative_to'" />
          {{ app.alternativeTo }}
        </template>
      </p>

      <p>
        <YIcon iname="comments" /> {{ $t('app.info.problem') }}
        <a :href="`https://forum.yunohost.org/tag/${id}`" target="_blank">
          {{ $t('app.info.forum') }}
        </a>
      </p>

      <VueShowdown :markdown="app.description" />
    </section>

    <YAlert v-if="config_panel_err" class="mb-4" variant="danger" icon="bug">
      <p>{{ $t('app.info.config_panel_error') }}</p>
      <p>{{ config_panel_err }}</p>
      <p>{{ $t('app.info.config_panel_error_please_report') }}</p>
    </YAlert>

    <!-- BASIC INFOS -->
    <ConfigPanels
      v-bind="config"
      :external-results="externalResults"
      @apply="onConfigSubmit"
    >
      <!-- OPERATIONS TAB -->
      <template v-if="currentTab === 'operations'" #tab-top>
        <!-- CHANGE PERMISSIONS LABEL -->
        <BFormGroup
          :label="$t('app_manage_label_and_tiles')"
          label-class="font-weight-bold"
        >
          <FormField
            v-for="(perm, i) in app.permissions"
            :key="i"
            :label="perm.title"
            :label-for="'perm-' + i"
            label-cols="0"
            label-class=""
            class="m-0"
            :validation="v$.form.labels.$each[i]"
          >
            <template #default="{ self }">
              <BInputGroup>
                <InputItem
                  :state="self.state"
                  v-model="form.labels[i].label"
                  :id="'perm' + i"
                  :aria-describedby="'perm-' + i + '_group__BV_description_'"
                />
                <BInputGroupAppend v-if="perm.tileAvailable" is-text>
                  <CheckboxItem
                    v-model="form.labels[i].show_tile"
                    :label="$t('permission_show_tile_enabled')"
                  />
                </BInputGroupAppend>
                <BInputGroupAppend>
                  <BButton
                    variant="info"
                    v-t="'save'"
                    @click="changeLabel(perm.name, form.labels[i])"
                  />
                </BInputGroupAppend>
              </BInputGroup>
            </template>

            <template v-if="perm.url" #description>
              {{ $t('permission_corresponding_url') }}:
              <BLink :href="'https://' + perm.url">
                https://{{ perm.url }}
              </BLink>
            </template>
          </FormField>
        </BFormGroup>
        <hr />

        <!-- PERMISSIONS -->
        <BFormGroup
          :label="$t('app_info_access_desc')"
          label-for="permissions"
          label-class="font-weight-bold"
          label-cols-lg="0"
        >
          {{
            allowedGroups.length > 0 ? allowedGroups.join(', ') : $t('nobody')
          }}
          <BButton
            size="sm"
            :to="{ name: 'group-list' }"
            variant="info"
            class="ml-2"
          >
            <YIcon iname="key-modern" />
            {{ $t('groups_and_permissions_manage') }}
          </BButton>
        </BFormGroup>
        <hr />

        <!-- CHANGE URL -->
        <BFormGroup
          :label="$t('app_info_changeurl_desc')"
          label-for="input-url"
          :label-cols-lg="app.supports_change_url ? 0 : 0"
          label-class="font-weight-bold"
          v-if="app.is_webapp"
        >
          <BInputGroup v-if="app.supports_change_url">
            <BInputGroupPrepend is-text> https:// </BInputGroupPrepend>

            <BInputGroupPrepend class="flex-grow-1">
              <BFormSelect v-model="form.url.domain" :options="domains" />
            </BInputGroupPrepend>

            <BInputGroupPrepend is-text> / </BInputGroupPrepend>

            <BFormInput
              id="input-url"
              v-model="form.url.path"
              class="flex-grow-3"
            />

            <BInputGroupAppend>
              <BButton @click="changeUrl" variant="info" v-t="'save'" />
            </BInputGroupAppend>
          </BInputGroup>

          <div v-else class="alert alert-warning">
            <YIcon iname="exclamation" />
            {{ $t('app_info_change_url_disabled_tooltip') }}
          </div>
        </BFormGroup>
        <hr v-if="app.is_webapp" />

        <!-- MAKE DEFAULT -->
        <BFormGroup
          :label="$t('app_info_default_desc', { domain: app.domain })"
          label-for="main-domain"
          label-class="font-weight-bold"
          label-cols-md="4"
          v-if="app.is_webapp"
        >
          <template v-if="!app.is_default">
            <BButton
              @click="setAsDefaultDomain(false)"
              id="main-domain"
              variant="success"
            >
              <YIcon iname="star" /> {{ $t('app_make_default') }}
            </BButton>
          </template>

          <template v-else>
            <BButton
              @click="setAsDefaultDomain(true)"
              id="main-domain"
              variant="warning"
            >
              <YIcon iname="star" /> {{ $t('app_make_not_default') }}
            </BButton>
          </template>
        </BFormGroup>
      </template>
    </ConfigPanels>

    <BCard v-if="app && app.doc.admin.length" no-body>
      <BTabs card fill pills>
        <BTab v-for="[name, content] in app.doc.admin" :key="name">
          <template #title>
            <YIcon iname="book" class="mr-2" />
            {{ name === 'admin' ? $t('app.doc.admin.title') : name }}
          </template>
          <VueShowdown :markdown="content" />
        </BTab>
      </BTabs>
    </BCard>

    <YCard
      v-if="app && app.integration"
      id="app-integration"
      :title="$t('app.integration.title')"
      collapsable
      collapsed
      no-body
    >
      <BListGroup flush>
        <YListGroupItem variant="info">
          {{ $t('app.integration.archs') }} {{ app.integration.archs }}
        </YListGroupItem>
        <YListGroupItem
          v-if="app.integration.ldap"
          :variant="app.integration.ldap === true ? 'success' : 'warning'"
        >
          {{ $t(`app.integration.ldap.${app.integration.ldap}`) }}
        </YListGroupItem>
        <YListGroupItem
          v-if="app.integration.sso"
          :variant="app.integration.sso === true ? 'success' : 'warning'"
        >
          {{ $t(`app.integration.sso.${app.integration.sso}`) }}
        </YListGroupItem>
        <YListGroupItem variant="info">
          {{
            $t(
              `app.integration.multi_instance.${app.integration.multi_instance}`,
            )
          }}
        </YListGroupItem>
        <YListGroupItem variant="info">
          {{ $t('app.integration.resources', app.integration.resources) }}
        </YListGroupItem>
      </BListGroup>
    </YCard>

    <YCard
      v-if="app"
      id="app-links"
      icon="link"
      :title="$t('app.links.title')"
      collapsable
      collapsed
      no-body
    >
      <BListGroup flush>
        <YListGroupItem v-for="[key, link] in app.links" :key="key" no-status>
          <BLink :href="link" target="_blank">
            <YIcon :iname="appLinksIcons(key)" class="mr-1" />
            {{ $t('app.links.' + key) }}
          </BLink>
        </YListGroupItem>
      </BListGroup>
    </YCard>

    <BModal
      v-if="app"
      id="uninstall-modal"
      :title="$t('confirm_uninstall', { name: id })"
      header-bg-variant="warning"
      :body-class="{ 'd-none': !app.supports_purge }"
      body-bg-variant=""
      @ok="uninstall"
    >
      <BFormGroup v-if="app.supports_purge">
        <BFormCheckbox v-model="purge">
          {{ $t('app.uninstall.purge_desc', { name: id }) }}
        </BFormCheckbox>
      </BFormGroup>
    </BModal>

    <template #skeleton>
      <CardInfoSkeleton :item-count="8" />
      <CardFormSkeleton />
    </template>
  </ViewBase>
</template>

<script>
import { mapGetters } from 'vuex'
import { useVuelidate } from '@vuelidate/core'

import api, { objectToParams } from '@/api'
import { humanPermissionName } from '@/helpers/filters/human'
import { helpers, required } from '@/helpers/validators'
import { isEmptyValue } from '@/helpers/commons'
import {
  formatFormData,
  formatI18nField,
  formatYunoHostConfigPanels,
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels.vue'

export default {
  compatConfig: { MODE: 3 },
  name: 'AppInfo',

  components: {
    ConfigPanels,
  },

  props: {
    id: { type: String, required: true },
  },

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      queries: [
        ['GET', `apps/${this.id}?full`],
        ['GET', { uri: 'users/permissions?full', storeKey: 'permissions' }],
        ['GET', { uri: 'domains' }],
      ],
      loading: true,
      app: undefined,
      form: undefined,
      purge: false,
      config_panel_err: null,
      config: {
        panels: [
          // Fake integration of operations in config panels
          {
            hasApplyButton: false,
            id: 'operations',
            name: this.$i18n.t('operations'),
          },
        ],
        validations: {},
      },
      externalResults: {},
      doc: undefined,
    }
  },

  computed: {
    ...mapGetters(['domains']),

    currentTab() {
      return this.$route.params.tabId
    },

    allowedGroups() {
      if (!this.app) return
      return this.app.permissions[0].allowed
    },
  },

  validations() {
    return {
      form: {
        labels: {
          $each: helpers.forEach({
            label: { required },
          }),
        },
        url: { path: { required } },
      },
    }
  },

  methods: {
    appLinksIcons(linkType) {
      const linksIcons = {
        license: 'institution',
        website: 'globe',
        admindoc: 'book',
        userdoc: 'book',
        code: 'code',
        package: 'code',
        package_license: 'institution',
        forum: 'comments',
      }
      return linksIcons[linkType]
    },

    async onQueriesResponse(app) {
      const form = { labels: [] }

      const mainPermission = app.permissions[this.id + '.main']
      mainPermission.name = this.id + '.main'
      mainPermission.title = this.$i18n.t('permission_main')
      mainPermission.tileAvailable =
        mainPermission.url !== null && !mainPermission.url.startsWith('re:')
      form.labels.push({
        label: mainPermission.label,
        show_tile: mainPermission.show_tile,
      })

      const permissions = [mainPermission]
      for (const [name, perm] of Object.entries(app.permissions)) {
        if (!name.endsWith('.main')) {
          permissions.push({
            ...perm,
            name,
            label: perm.sublabel,
            title: humanPermissionName(name),
            tileAvailable: perm.url !== null && !perm.url.startsWith('re:'),
          })
          form.labels.push({ label: perm.sublabel, show_tile: perm.show_tile })
        }
      }
      this.form = form

      const { DESCRIPTION, ADMIN, ...doc } = app.manifest.doc
      const notifs = app.manifest.notifications
      const {
        ldap,
        sso,
        multi_instance,
        ram,
        disk,
        architectures: archs,
      } = app.manifest.integration
      this.app = {
        id: this.id,
        version: app.version,
        label: mainPermission.label,
        domain: app.settings.domain,
        alternativeTo: app.from_catalog.potential_alternative_to?.length
          ? app.from_catalog.potential_alternative_to.join(
              this.$i18n.t('words.separator'),
            )
          : null,
        description: DESCRIPTION
          ? formatI18nField(DESCRIPTION)
          : app.description,
        integration:
          app.manifest.packaging_format >= 2
            ? {
                archs: Array.isArray(archs)
                  ? archs.join(this.$i18n.t('words.separator'))
                  : archs,
                ldap: ldap === 'not_relevant' ? null : ldap,
                sso: sso === 'not_relevant' ? null : sso,
                multi_instance,
                resources: { ram: ram.runtime, disk },
              }
            : null,
        links: [
          [
            'license',
            `https://spdx.org/licenses/${app.manifest.upstream.license}`,
          ],
          ...['website', 'admindoc', 'userdoc', 'code'].map((key) => {
            return [key, app.manifest.upstream[key]]
          }),
          ['package', app.from_catalog.git?.url],
          [
            'package_license',
            app.from_catalog.git?.url + '/blob/master/LICENSE',
          ],
          ['forum', `https://forum.yunohost.org/tag/${app.manifest.id}`],
        ].filter(([key, val]) => !!val),
        doc: {
          notifications: {
            postInstall:
              notifs.POST_INSTALL && notifs.POST_INSTALL.main
                ? [['main', formatI18nField(notifs.POST_INSTALL.main)]]
                : [],
            postUpgrade: notifs.POST_UPGRADE
              ? Object.entries(notifs.POST_UPGRADE).map(([key, content]) => {
                  return [key, formatI18nField(content)]
                })
              : [],
          },
          admin: [
            ['admin', formatI18nField(ADMIN)],
            ...Object.keys(doc)
              .sort()
              .map((key) => [
                key.charAt(0) + key.slice(1).toLowerCase(),
                formatI18nField(doc[key]),
              ]),
          ].filter((doc) => doc[1]),
        },
        is_webapp: app.is_webapp,
        is_default: app.is_default,
        supports_change_url: app.supports_change_url,
        supports_config_panel: app.supports_config_panel,
        supports_purge: app.supports_purge,
        permissions,
      }
      if (app.settings.domain && app.settings.path) {
        this.app.url = 'https://' + app.settings.domain + app.settings.path
        form.url = {
          domain: app.settings.domain,
          path: app.settings.path.slice(1),
        }
      }

      if (
        !Object.values(this.app.doc.notifications).some((notif) => notif.length)
      ) {
        this.app.doc.notifications = null
      }

      if (app.supports_config_panel) {
        await api
          .get(`apps/${this.id}/config?full`)
          .then((config) => {
            const config_ = formatYunoHostConfigPanels(config)
            // reinject 'operations' fake config tab
            config_.panels.unshift(this.config.panels[0])
            this.config = config_
          })
          .catch((err) => {
            this.config_panel_err = err.message
          })
      }
      this.loading = false
    },

    async onConfigSubmit({ id, form, action, name }) {
      const args = await formatFormData(form, {
        removeEmpty: false,
        removeNull: true,
      })

      api
        .put(
          action
            ? `apps/${this.id}/actions/${action}`
            : `apps/${this.id}/config/${id}`,
          isEmptyValue(args) ? {} : { args: objectToParams(args) },
          {
            key: `apps.${action ? 'action' : 'update'}_config`,
            id,
            name: this.id,
          },
        )
        .then(() => {
          this.loading = true
          this.$refs.view.fetchQueries()
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          const panel = this.config.panels.find((panel) => panel.id === id)
          if (err.data.name) {
            Object.assign(this.externalResults, {
              forms: { [panel.id]: { [err.data.name]: [err.data.error] } },
            })
          } else this.$set(panel, 'serverError', err.message)
        })
    },

    changeLabel(permName, data) {
      data.show_tile = data.show_tile ? 'True' : 'False'
      api
        .put('users/permissions/' + permName, data, {
          key: 'apps.change_label',
          prevName: this.app.label,
          nextName: data.label,
        })
        .then(this.$refs.view.fetchQueries)
    },

    async changeUrl() {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_app_change_url'),
      )
      if (!confirmed) return

      const { domain, path } = this.form.url
      api
        .put(
          `apps/${this.id}/changeurl`,
          { domain, path: '/' + path },
          { key: 'apps.change_url', name: this.app.label },
        )
        .then(this.$refs.view.fetchQueries)
    },

    async setAsDefaultDomain(undo = false) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_app_default'),
      )
      if (!confirmed) return

      api
        .put(
          `apps/${this.id}/default${undo ? '?undo' : ''}`,
          {},
          {
            key: 'apps.set_default',
            name: this.app.label,
            domain: this.app.domain,
          },
        )
        .then(this.$refs.view.fetchQueries)
    },

    async dismissNotification(name) {
      api
        .put(
          `apps/${this.id}/dismiss_notification/${name}`,
          {},
          { key: 'apps.dismiss_notification', name: this.app.label },
        )
        .then(this.$refs.view.fetchQueries)
    },

    async uninstall() {
      const data = this.purge === true ? { purge: 1 } : {}
      api
        .delete('apps/' + this.id, data, {
          key: 'apps.uninstall',
          name: this.app.label,
        })
        .then(() => {
          this.$router.push({ name: 'app-list' })
        })
    },
  },
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

.tiny {
  font-size: 50%;
  font-weight: normal;
}

.yuno-alert div div:not(:last-child) {
  margin-bottom: 1rem;
}
</style>
