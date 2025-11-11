<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { type APIError } from '@/api/errors'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useDomains } from '@/composables/data'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue, joinOrNull, toEntries } from '@/helpers/commons'
import type { Obj } from '@/types/commons'
import { humanPermissionName } from '@/helpers/filters/human'
import { formatI18nField } from '@/helpers/yunohostArguments'
import type { AppInfo } from '@/types/core/api'
import type { CoreConfigPanels } from '@/types/core/options'
import AppIntegrationAndLinks from './_AppIntegrationAndLinks.vue'
import {
  formatAppIntegration,
  formatAppLinks,
  formatAppNotifs,
} from './appData'

const props = defineProps<{
  id: string
  coreTabId?: string
  tabId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()
const { domainsAsChoices } = useDomains()

const showModalUninstall = ref(false)
const changeUrlErrors = ref('')
const purge = ref(false)

const [app, changeUrlForm, coreConfigData, appConfigData, configPanelErr] =
  await api
    .fetchAll<
      [AppInfo, CoreConfigPanels]
    >([{ uri: `apps/${props.id}?full&with_pre_upgrade_notifications` }, { uri: `apps/${props.id}/config?full&core` }])
    .then(async ([app_, coreConfigData]) => {
      // Query config panels if app supports it
      let appConfigData: CoreConfigPanels | undefined
      let appConfigPanelErr: string | undefined
      if (app_.supports_config_panel) {
        await api
          .get<CoreConfigPanels>(`apps/${props.id}/config?full`)
          .then((data) => (appConfigData = data))
          .catch((err: APIError) => (appConfigPanelErr = err.message))
      }

      const { domain, path } = app_.settings
      const changeUrlForm = ref({
        url: domain && path ? { domain, path: path.slice(1) } : undefined,
      })
      const permissions = []
      for (const [name, perm] of toEntries(app_.permissions)) {
        const isMain = name.endsWith('.main')
        const permission = {
          ...perm,
          name,
          label: isMain ? perm.label : perm.sublabel,
          title: isMain ? t('permission_main') : humanPermissionName(name),
          tileAvailable: !!perm.url && !perm.url.startsWith('re:'),
        }
        permissions.push(permission)
      }

      const { DESCRIPTION, ADMIN, ...doc } = app_.manifest.doc
      const notifs = app_.manifest.notifications
      // App may not have 'main' permission
      const label = app_.label || app_.id
      const app = {
        id: props.id,
        version: app_.version,
        label,
        domain,
        logo: app_.logo,
        url: domain && path ? `https://${domain}${path}` : null,
        alternativeTo: joinOrNull(app_.from_catalog.potential_alternative_to),
        description: formatI18nField(DESCRIPTION) || app_.description,
        upgrade: app_.upgrade,
        integration: formatAppIntegration(
          app_.manifest.integration,
          app_.manifest.packaging_format,
        ),
        // TODO: could return `remote` key of manifest to pass only manifest and id?
        links: formatAppLinks({
          ...app_.manifest,
          // @ts-expect-error meh
          remote: app_.from_catalog.git ?? { url: null },
        }),
        doc: {
          notifications: {
            postInstall: notifs.POST_INSTALL?.main
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
        isWebapp: app_.is_webapp,
        supportsChangeUrl: app_.supports_change_url,
        supportsPurge: app_.supports_purge,
      }

      return [
        app,
        changeUrlForm,
        coreConfigData,
        appConfigData,
        appConfigPanelErr,
      ] as const
    })

const coreConfig = useConfigPanels(
  formatConfigPanels(coreConfigData),
  () => props.coreTabId,
  async ({ panelId, data, action }, onError) => {
    api
      .put({
        uri: action
          ? `apps/${props.id}/actions/${action}?core`
          : `apps/${props.id}/config/${panelId}?core`,
        data: isEmptyValue(data) ? {} : { args: objectToParams(data) },
      })
      .then(() => api.refetch())
      .catch(onError)
  },
  'coreTabId',
)

const appConfig = appConfigData
  ? useConfigPanels(
      formatConfigPanels(appConfigData),
      () => props.tabId,
      ({ panelId, data, action }, onError) => {
        api
          .put({
            uri: action
              ? `apps/${props.id}/actions/${action}`
              : `apps/${props.id}/config/${panelId}`,
            data: isEmptyValue(data) ? {} : { args: objectToParams(data) },
          })
          .then(() => api.refetch())
          .catch(onError)
      },
    )
  : undefined

async function dismissNotification(name: string) {
  api
    .put({ uri: `apps/${props.id}/dismiss_notification/${name}` })
    // FIXME no need to refetch i guess, filter the reactive notifs?
    .then(() => api.refetch())
}

async function changeUrl() {
  const confirmed = await modalConfirm(t('confirm_app_change_url'))
  if (!confirmed) return

  const { domain, path } = changeUrlForm.value.url!
  api
    .put({
      uri: `apps/${props.id}/changeurl`,
      data: { domain, path: '/' + path },
    })
    // Refetch because some content of this page relies on the url
    .then(() => api.refetch())
    .catch((err) => (changeUrlErrors.value = err.message))
}

async function forceUpgrade() {
  const confirmed = await modalConfirm(t('confirm_app_force_upgrade'))
  if (!confirmed) return
  await upgrade(true)
}

async function regularUpgrade() {
  const confirmed = await modalConfirm(
    app.upgrade.notifications
      ? '<strong><em>' +
          t('app.upgrade.notifs.pre.alert') +
          '</em></strong><hr/>' +
          formatAppNotifs(app.upgrade.notifications)
      : '',
    {
      title: t('confirm_app_upgrade'),
    },
    { markdown: true },
  )
  if (!confirmed) return
  await upgrade(false)
}

async function upgrade(force: boolean) {
  await api
    .put<Obj>({ uri: `apps/${app.id}/upgrade` + (force ? '?force' : '') })
    .then((response) => {
      const postMessage = formatAppNotifs(response.notifications.POST_UPGRADE)
      if (postMessage) {
        const message =
          '<small><em>' +
          t('app.upgrade.notifs.post.alert') +
          '</em></small>\n\n' +
          postMessage
        modalConfirm(
          message,
          {
            title: t('app.upgrade.notifs.post.title', {
              name: app.label,
            }),
          },
          { markdown: true, cancelable: false },
        )
      }
      api.refetch()
    })
}

async function showModalUninstallButton() {
  showModalUninstall.value = true
}

async function uninstall() {
  const params = purge.value === true ? { purge: 1 } : {}
  api
    .delete({ uri: `apps/${props.id}`, params })
    .then(() => router.push({ name: 'app-list' }))
}
</script>

<template>
  <div>
    <YAlert
      v-if="app.doc.notifications.postInstall.length"
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
      v-if="app.doc.notifications.postUpgrade.length"
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

    <section class="border rounded p-3 mb-4">
      <div class="d-md-flex align-items-center mb-2">
        <h1 class="mb-3 mb-md-0">
          <template v-if="app.logo">
            <img class="rounded" :src="`./applogos/${app.logo}.png`" />
          </template>
          <template v-else>
            <YIcon iname="cube" />
          </template>

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
      </div>

      <p class="text-secondary">
        <strong v-t="'app.installed_version'" /> {{ app.version }}<br />

        <template v-if="app.alternativeTo">
          <strong v-t="'app.potential_alternative_to'" />
          {{ app.alternativeTo }}
        </template>
      </p>

      <VueShowdown :markdown="app.description" />
    </section>

    <!-- APP CONFIG PANEL -->
    <YAlert v-if="configPanelErr" class="mb-4" variant="danger" icon="bug">
      <p>{{ $t('app.info.config_panel_error') }}</p>
      <p>{{ configPanelErr }}</p>
      <p>{{ $t('app.info.config_panel_error_please_report') }}</p>
    </YAlert>
    <ConfigPanelsComponent
      v-if="appConfig"
      v-model="appConfig.form.value"
      :panel="appConfig.panel.value"
      :validations="appConfig.v.value"
      :routes="appConfig.routes"
      @apply="appConfig.onPanelApply"
    />

    <!-- ADMIN DOC -->
    <BCard v-if="app.doc.admin.length > 1" no-body>
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
      v-else-if="app.doc.admin.length == 1"
      :title="$t('app.doc.admin.title')"
      icon="book"
    >
      <VueShowdown :markdown="app.doc.admin[0][1]" />
    </YCard>

    <!-- CORE CONFIG PANEL -->
    <ConfigPanelsComponent
      v-model="coreConfig.form.value"
      :panel="coreConfig.panel.value"
      :validations="coreConfig.v.value"
      :routes="coreConfig.routes"
      @apply="coreConfig.onPanelApply"
    />

    <YCard id="operations" :title="$t('operations')" icon="wrench">
      <!-- Upgrade -->

      <h5
        :class="
          app.upgrade.status == 'up_to_date'
            ? ''
            : app.upgrade.status == 'upgradable'
              ? 'text-info'
              : app.upgrade.status == 'url_required'
                ? 'text-muted'
                : app.upgrade.status == 'bad_quality'
                  ? 'text-warning'
                  : 'text-info'
        "
      >
        {{ $t('app.upgrade.upgrade') }}
      </h5>

      <YAlert
        v-if="app.upgrade.specific_channel_message"
        variant="warning"
        class="py-2 m-2"
      >
        <VueShowdown :markdown="app.upgrade.specific_channel_message" />
      </YAlert>

      <div v-if="app.upgrade.status == 'up_to_date'" class="text-success">
        <YIcon iname="check" class="pe-1" />
        <span v-t="'app.upgrade.up_to_date'"></span>
        <small class="ps-1 text-secondary">({{ app.version }})</small>
      </div>

      <div v-if="app.upgrade.status == 'up_to_date'" class="pb-2">
        <small v-t="'app.upgrade.advertise_testing_version'"></small>
        <BLink
          v-if="app.links.package"
          :href="app.links.package[1] + '/pulls'"
          target="_blank"
        >
          <YIcon iname="external-link" class="ms-2" />
        </BLink>
      </div>

      <ButtonWithDetails
        v-if="app.upgrade.status == 'up_to_date'"
        :label="$t('app.upgrade.force_upgrade')"
        icon="refresh"
        :details="app.upgrade.message"
        variant="outline-secondary"
        :onclick="forceUpgrade"
      />
      <ButtonWithDetails
        v-else
        :label="$t('app.upgrade.upgrade')"
        icon="arrow-up"
        :details="app.upgrade.message"
        :variant="
          app.upgrade.status == 'upgradable'
            ? 'success'
            : app.upgrade.status == 'url_required'
              ? 'outline-secondary'
              : app.upgrade.status == 'bad_quality'
                ? 'warning'
                : 'info'
        "
        :disabled="app.upgrade.status != 'upgradable'"
        :onclick="regularUpgrade"
      />

      <hr />

      <!-- Change url -->

      <h5 v-if="app.isWebapp">{{ $t('app.change_url.title') }}</h5>

      <BRow
        v-if="app.isWebapp && app.supportsChangeUrl && changeUrlForm.url"
        no-gutters
        class="button-with-details w-100"
      >
        <BCol>
          <BInputGroup v-if="app.supportsChangeUrl && changeUrlForm.url">
            <BInputGroupText>https://</BInputGroupText>
            <BFormSelect
              v-model="changeUrlForm.url.domain"
              :options="domainsAsChoices"
            />
            <BInputGroupText>/</BInputGroupText>
            <BFormInput v-model="changeUrlForm.url.path" class="flex-grow-3" />
          </BInputGroup>
        </BCol>
        <BCol class="text-center" cols="12" md="4" lg="3">
          <BButton variant="info" class="mt-2 mt-md-0" @:click="changeUrl">
            <YIcon iname="truck" class="me-2" />
            <span>{{ $t('app.change_url.change_url') }}</span>
          </BButton>
        </BCol>
      </BRow>

      <div v-else-if="app.isWebapp">
        {{ $t('app.change_url.not_supported') }}
      </div>

      <div v-if="changeUrlErrors" class="text-danger">
        <VueShowdown
          :markdown="changeUrlErrors"
          :options="{ headerLevelStart: 4 }"
        />
      </div>

      <hr v-if="app.isWebapp" />

      <!-- Uninstall -->

      <h5 class="text-danger">{{ $t('app.uninstall.uninstall') }}</h5>

      <ButtonWithDetails
        :label="$t('app.uninstall.uninstall')"
        icon="trash"
        :details="$t('app.uninstall.desc')"
        variant="danger"
        :onclick="showModalUninstallButton"
      />
    </YCard>

    <AppIntegrationAndLinks :integration="app.integration" :links="app.links" />

    <BModal
      id="uninstall-modal"
      v-model="showModalUninstall"
      centered
      :title="$t('confirm_uninstall', { name: id })"
      header-variant="warning"
      :body-class="{ 'd-none': !app.supportsPurge }"
      @ok="uninstall"
    >
      <BFormGroup v-if="app.supportsPurge">
        <BFormCheckbox v-model="purge">
          {{ $t('app.uninstall.purge_desc', { name: id }) }}
        </BFormCheckbox>
      </BFormGroup>
    </BModal>
  </div>
</template>

<style lang="scss" scoped>
h1 img {
  width: 2.5rem;
}

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

// FIXME bootstrap-vue-next bug
:deep(.card-header-tabs) {
  margin-bottom: unset;
}
</style>
