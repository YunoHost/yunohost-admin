<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { type APIError } from '@/api/errors'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import type {
  ConfigPanelsProps,
  OnPanelApply,
} from '@/composables/configPanels'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { isEmptyValue } from '@/helpers/commons'
import { humanPermissionName } from '@/helpers/filters/human'
import { helpers, required } from '@/helpers/validators'
import { formatI18nField } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'
import type { CoreConfigPanels } from '@/types/core/options'

const props = defineProps<{
  id: string
  tabId?: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const modalConfirm = useAutoModal()

const { domains } = useStoreGetters()

// FIXME
type AppForm = {
  labels: { label: string; show_tile: boolean }[]
  url: { domain: string; path: string }
}
const form: AppForm = reactive({
  labels: [],
  url: { domain: '', path: '' },
})
const rules = computed(() => ({
  labels: {
    $each: helpers.forEach({
      label: { required },
    }),
  },
  url: { path: { required } },
}))
const externalResults = reactive({})
const v$ = useVuelidate(rules, form, { $externalResults: externalResults })
const { loading, refetch } = useInitialQueries(
  [
    ['GET', `apps/${props.id}?full`],
    ['GET', { uri: 'users/permissions?full', storeKey: 'permissions' }],
    ['GET', { uri: 'domains' }],
  ],
  { onQueriesResponse },
)

const app = ref()
const purge = ref(false)
const configPanelErr = ref('')
const config = shallowRef<ConfigPanelsProps | undefined>()
const doc = ref()

const currentTab = computed(() => {
  return route.params.tabId
})

const allowedGroups = computed(() => {
  if (!app.value) return
  return app.value.permissions[0].allowed
})

function appLinksIcons(linkType) {
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
}

async function onQueriesResponse(app_: any) {
  // const form = { labels: [] }

  const mainPermission = app_.permissions[props.id + '.main']
  mainPermission.name = props.id + '.main'
  mainPermission.title = t('permission_main')
  mainPermission.tileAvailable =
    mainPermission.url !== null && !mainPermission.url.startsWith('re:')
  form.labels.push({
    label: mainPermission.label,
    show_tile: mainPermission.show_tile,
  })

  const permissions = [mainPermission]
  for (const [name, perm] of Object.entries(app_.permissions)) {
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
  // this.form = form

  const { DESCRIPTION, ADMIN, ...doc } = app_.manifest.doc
  const notifs = app_.manifest.notifications
  const {
    ldap,
    sso,
    multi_instance,
    ram,
    disk,
    architectures: archs,
  } = app_.manifest.integration
  app.value = {
    id: props.id,
    version: app_.version,
    label: mainPermission.label,
    domain: app_.settings.domain,
    alternativeTo: app_.from_catalog.potential_alternative_to?.length
      ? app_.from_catalog.potential_alternative_to.join(t('words.separator'))
      : null,
    description: DESCRIPTION ? formatI18nField(DESCRIPTION) : app_.description,
    integration:
      app_.manifest.packaging_format >= 2
        ? {
            archs: Array.isArray(archs)
              ? archs.join(t('words.separator'))
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
        `https://spdx.org/licenses/${app_.manifest.upstream.license}`,
      ],
      ...['website', 'admindoc', 'userdoc', 'code'].map((key) => {
        return [key, app_.manifest.upstream[key]]
      }),
      ['package', app_.from_catalog.git?.url],
      ['package_license', app_.from_catalog.git?.url + '/blob/master/LICENSE'],
      ['forum', `https://forum.yunohost.org/tag/${app_.manifest.id}`],
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
    is_webapp: app_.is_webapp,
    is_default: app_.is_default,
    supports_change_url: app_.supports_change_url,
    supports_config_panel: app_.supports_config_panel,
    supports_purge: app_.supports_purge,
    permissions,
  }
  if (app_.settings.domain && app_.settings.path) {
    app.value.url = 'https://' + app_.settings.domain + app_.settings.path
    form.url = {
      domain: app_.settings.domain,
      path: app_.settings.path.slice(1),
    }
  }

  if (
    !Object.values(app.value.doc.notifications).some((notif) => notif.length)
  ) {
    app.value.doc.notifications = null
  }

  if (app_.supports_config_panel) {
    await api
      .get(`apps/${props.id}/config?full`)
      .then((cp) => {
        const config_ = cp as CoreConfigPanels
        // Fake integration of operations in config panels
        config_.panels.unshift({
          id: 'operations',
          name: t('operations'),
        })
        config.value = useConfigPanels(
          formatConfigPanels(config_),
          () => props.tabId,
          onPanelApply,
        )
      })
      .catch((err: APIError) => {
        configPanelErr.value = err.message
      })
  }
}

const onPanelApply: OnPanelApply = ({ panelId, data, action }, onError) => {
  api
    .put(
      action
        ? `apps/${props.id}/actions/${action}`
        : `apps/${props.id}/config/${panelId}`,
      isEmptyValue(data) ? {} : { args: objectToParams(data) },
      {
        key: `apps.${action ? 'action' : 'update'}_config`,
        id: panelId,
        name: props.id,
      },
    )
    .then(() => refetch())
    .catch(onError)
}

function changeLabel(permName, data) {
  data.show_tile = data.show_tile ? 'True' : 'False'
  api
    .put('users/permissions/' + permName, data, {
      key: 'apps.change_label',
      prevName: app.value.label,
      nextName: data.label,
    })
    .then(() => refetch(false))
}

async function changeUrl() {
  const confirmed = await modalConfirm(t('confirm_app_change_url'))
  if (!confirmed) return

  const { domain, path } = form.url
  api
    .put(
      `apps/${props.id}/changeurl`,
      { domain, path: '/' + path },
      { key: 'apps.change_url', name: app.value.label },
    )
    .then(() => refetch(false))
}

async function setAsDefaultDomain(undo = false) {
  const confirmed = await modalConfirm(t('confirm_app_default'))
  if (!confirmed) return

  api
    .put(
      `apps/${props.id}/default${undo ? '?undo' : ''}`,
      {},
      {
        key: 'apps.set_default',
        name: app.value.label,
        domain: app.value.domain,
      },
    )
    .then(() => refetch(false))
}

async function dismissNotification(name: string) {
  api
    .put(
      `apps/${props.id}/dismiss_notification/${name}`,
      {},
      { key: 'apps.dismiss_notification', name: app.value.label },
    )
    .then(() => refetch(false))
}

async function uninstall() {
  const data = purge.value === true ? { purge: 1 } : {}
  api
    .delete('apps/' + props.id, data, {
      key: 'apps.uninstall',
      name: app.value.label,
    })
    .then(() => {
      router.push({ name: 'app-list' })
    })
}
</script>

<template>
  <ViewBase :loading="loading">
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
          class="ms-auto me-2"
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
          class="ms-auto me-2"
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
          class="ms-auto me-2"
        >
          <YIcon iname="external-link" />
          {{ $t('app.open_this_app') }}
        </BButton>

        <BButton
          v-b-modal.uninstall-modal
          id="uninstall"
          variant="danger"
          :class="{ 'ms-auto': !app.url }"
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

    <YAlert v-if="configPanelErr" class="mb-4" variant="danger" icon="bug">
      <p>{{ $t('app.info.config_panel_error') }}</p>
      <p>{{ configPanelErr }}</p>
      <p>{{ $t('app.info.config_panel_error_please_report') }}</p>
    </YAlert>

    <!-- BASIC INFOS -->
    <ConfigPanelsComponent
      v-if="config"
      v-model="config.form"
      :panel="config.panel.value"
      :validations="config.v.value"
      :routes="config.routes"
      @apply="config.onPanelApply"
    >
      <!-- OPERATIONS TAB -->
      <template v-if="currentTab === 'operations'" #default>
        <!-- CHANGE PERMISSIONS LABEL -->
        <BFormGroup
          :label="$t('app_manage_label_and_tiles')"
          label-class="fw-bold"
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

                <BInputGroupText v-if="perm.tileAvailable">
                  <CheckboxItem
                    v-model="form.labels[i].show_tile"
                    :label="$t('permission_show_tile_enabled')"
                  />
                </BInputGroupText>

                <BButton
                  variant="info"
                  v-t="'save'"
                  @click="changeLabel(perm.name, form.labels[i])"
                />
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
          label-class="fw-bold"
          label-cols-lg="0"
        >
          {{
            allowedGroups.length > 0 ? allowedGroups.join(', ') : $t('nobody')
          }}
          <BButton
            size="sm"
            :to="{ name: 'group-list' }"
            variant="info"
            class="ms-2"
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
          label-class="fw-bold"
          v-if="app.is_webapp"
        >
          <BInputGroup v-if="app.supports_change_url">
            <BInputGroupText>https://</BInputGroupText>

            <BFormSelect v-model="form.url.domain" :options="domains" />

            <BInputGroupText>/</BInputGroupText>

            <BFormInput
              id="input-url"
              v-model="form.url.path"
              class="flex-grow-3"
            />

            <BButton @click="changeUrl" variant="info" v-t="'save'" />
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
          label-class="fw-bold"
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
    </ConfigPanelsComponent>

    <BCard v-if="app && app.doc.admin.length" no-body>
      <BTabs card fill pills>
        <BTab v-for="[name, content] in app.doc.admin" :key="name">
          <template #title>
            <YIcon iname="book" class="me-2" />
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
            <YIcon :iname="appLinksIcons(key)" class="me-1" />
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
      header-class="text-black"
      :body-class="{ 'd-none': !app.supports_purge }"
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
