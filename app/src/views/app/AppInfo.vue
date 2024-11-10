<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { type APIError } from '@/api/errors'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useDomains } from '@/composables/data'
import { useArrayRule, useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue, joinOrNull, pick, toEntries } from '@/helpers/commons'
import { humanPermissionName } from '@/helpers/filters/human'
import { required } from '@/helpers/validators'
import { formatI18nField } from '@/helpers/yunohostArguments'
import type { Obj } from '@/types/commons'
import type { AppInfo } from '@/types/core/api'
import type { Permission } from '@/types/core/data'
import type { CoreConfigPanels } from '@/types/core/options'
import type { BaseItemComputedProps } from '@/types/form'
import AppIntegrationAndLinks from './_AppIntegrationAndLinks.vue'
import { formatAppIntegration, formatAppLinks } from './appData'

const props = defineProps<{
  id: string
  tabId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

const [app, form, coreConfig, configPanelErr] = await api
  .fetchAll<[AppInfo, Obj<Permission>]>([
    { uri: `apps/${props.id}?full` },
    // FIXME permissions needed?
    { uri: 'users/permissions?full', cachePath: 'permissions' },
    { uri: 'domains', cachePath: 'domains' },
  ])
  .then(async ([app_]) => {
    // Query config panels if app supports it
    let config: CoreConfigPanels = {
      panels: [{ id: 'operations', name: t('operations') }],
    }
    let configPanelErr: string | undefined
    if (app_.supports_config_panel) {
      await api
        .get<CoreConfigPanels>(`apps/${props.id}/config?full`)
        .then((coreConfig) => {
          // Fake integration of operations in config panels
          coreConfig.panels.unshift(config.panels[0])
          config = coreConfig
        })
        .catch((err: APIError) => {
          configPanelErr = err.message
        })
    }

    const { domain, path } = app_.settings
    const form = ref({
      labels: [] as { label: string; show_tile: boolean }[],
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
      form.value.labels.push(pick(permission, ['label', 'show_tile']))
    }

    const { DESCRIPTION, ADMIN, ...doc } = app_.manifest.doc
    const notifs = app_.manifest.notifications
    const { label, allowed } = app_.permissions[props.id + '.main']
    const app = {
      id: props.id,
      version: app_.version,
      label,
      domain,
      url: domain && path ? `https://${domain}${path}` : null,
      allowedGroups: allowed.length ? allowed.join(', ') : t('nobody'),
      alternativeTo: joinOrNull(app_.from_catalog.potential_alternative_to),
      description: formatI18nField(DESCRIPTION) || app_.description,
      integration: formatAppIntegration(
        app_.manifest.integration,
        app_.manifest.packaging_format,
      ),
      // TODO: could return `remote` key of manifest to pass only manifest and id?
      links: formatAppLinks({
        ...app_.manifest,
        // @ts-expect-error
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
      isDefault: ref(app_.is_default),
      supportsChangeUrl: app_.supports_change_url,
      supportsPurge: app_.supports_purge,
      permissions,
    }

    return [app, form, config, configPanelErr] as const
  })
const { domainsAsChoices } = useDomains()

const config = coreConfig
  ? useConfigPanels(
      formatConfigPanels(coreConfig),
      () => props.tabId,
      ({ panelId, data, action }, onError) => {
        api
          .put({
            uri: action
              ? `apps/${props.id}/actions/${action}`
              : `apps/${props.id}/config/${panelId}`,
            data: isEmptyValue(data) ? {} : { args: objectToParams(data) },
            humanKey: {
              key: `apps.${action ? 'action' : 'update'}_config`,
              id: panelId,
              name: props.id,
            },
          })
          .then(() => api.refetch())
          .catch(onError)
      },
    )
  : undefined

const fields = {
  labels: reactive({
    rules: useArrayRule(() => form.value.labels, { label: { required } }),
  }),
  url: {
    rules: { domain: { required } },
  },
}
const { v } = useForm(form, fields)
const purge = ref(false)

async function changeLabel(permName: string, i: number) {
  if (!(await v.value.form.labels[i].$validate())) return
  const data = form.value.labels[i]
  api
    .put({
      uri: 'users/permissions/' + permName,
      data: {
        label: data.label,
        show_tile: data.show_tile ? 'True' : 'False',
      },
      humanKey: {
        key: 'apps.change_label',
        prevName: app.label,
        nextName: data.label,
      },
    })
    // FIXME really need to refetch? permissions store update should be ok
    .then(() => api.refetch())
}

async function changeUrl() {
  if (!(await v.value.form.url.$validate())) return
  const confirmed = await modalConfirm(t('confirm_app_change_url'))
  if (!confirmed) return

  const { domain, path } = form.value.url!
  api
    .put({
      uri: `apps/${props.id}/changeurl`,
      data: { domain, path: '/' + path },
      humanKey: { key: 'apps.change_url', name: app.label },
    })
    // Refetch because some content of this page relies on the url
    .then(() => api.refetch())
}

async function setAsDefaultDomain(undo = false) {
  const confirmed = await modalConfirm(t('confirm_app_default'))
  if (!confirmed) return

  api
    .put({
      uri: `apps/${props.id}/default${undo ? '?undo' : ''}`,
      humanKey: {
        key: 'apps.set_default',
        name: app.label,
        domain: app.domain,
      },
    })
    .then(() => (app.isDefault.value = true))
}

async function dismissNotification(name: string) {
  api
    .put({
      uri: `apps/${props.id}/dismiss_notification/${name}`,
      humanKey: { key: 'apps.dismiss_notification', name: app.label },
    })
    // FIXME no need to refetch i guess, filter the reactive notifs?
    .then(() => api.refetch())
}

async function uninstall() {
  const data = purge.value === true ? { purge: 1 } : {}
  api
    .delete({
      uri: 'apps/' + props.id,
      data,
      humanKey: { key: 'apps.uninstall', name: app.label },
    })
    .then(() => {
      router.push({ name: 'app-list' })
    })
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
          id="uninstall"
          v-b-modal.uninstall-modal
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
      v-model="config.form.value"
      :panel="config.panel.value"
      :validations="config.v.value"
      :routes="config.routes"
      @apply="config.onPanelApply"
    >
      <!-- OPERATIONS TAB -->
      <template v-if="tabId === 'operations'" #default>
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
            :validation="v.form.labels[i]"
          >
            <template #default="componentProps">
              <BInputGroup>
                <InputItem
                  :id="'perm' + i"
                  v-bind="componentProps as BaseItemComputedProps"
                  v-model="form.labels[i].label"
                />

                <BInputGroupText v-if="perm.tileAvailable">
                  <CheckboxItem
                    v-model="form.labels[i].show_tile"
                    :label="$t('permission_show_tile_enabled')"
                  />
                </BInputGroupText>

                <BButton
                  v-t="'save'"
                  variant="info"
                  @click="changeLabel(perm.name, i)"
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
          {{ app.allowedGroups }}
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
        <FormField
          v-if="app.isWebapp"
          :label="$t('app_info_changeurl_desc')"
          :label-cols="0"
          label-class="fw-bold"
        >
          <BInputGroup v-if="app.supportsChangeUrl && form.url">
            <BInputGroupText>https://</BInputGroupText>

            <BFormSelect
              v-model="form.url.domain"
              :options="domainsAsChoices"
            />

            <BInputGroupText>/</BInputGroupText>

            <BFormInput v-model="form.url.path" class="flex-grow-3" />

            <BButton v-t="'save'" variant="info" @click="changeUrl" />
          </BInputGroup>

          <div v-else class="alert alert-warning">
            <YIcon iname="exclamation" />
            {{ $t('app_info_change_url_disabled_tooltip') }}
          </div>
        </FormField>
        <hr v-if="app.isWebapp" />

        <!-- MAKE DEFAULT -->
        <FormField
          v-if="app.isWebapp"
          :label="$t('app_info_default_desc', { domain: app.domain })"
          label-for="main-domain"
          label-cols="0"
        >
          <template v-if="!app.isDefault.value">
            <BButton
              id="main-domain"
              variant="success"
              @click="setAsDefaultDomain(false)"
            >
              <YIcon iname="star" /> {{ $t('app_make_default') }}
            </BButton>
          </template>

          <template v-else>
            <BButton
              id="main-domain"
              variant="warning"
              @click="setAsDefaultDomain(true)"
            >
              <YIcon iname="star" /> {{ $t('app_make_not_default') }}
            </BButton>
          </template>
        </FormField>
      </template>
    </ConfigPanelsComponent>

    <BCard v-if="app.doc.admin.length" no-body>
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

    <AppIntegrationAndLinks :integration="app.integration" :links="app.links" />

    <BModal
      id="uninstall-modal"
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
