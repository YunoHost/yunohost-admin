<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { secondsToHours } from 'date-fns/secondsToHours'

import api from '@/api'
import CardCollapse from '@/components/CardCollapse.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { useSSE } from '@/composables/useSSE'
import type { SystemUpdate } from '@/types/core/api'
import { formatAppNotifs } from '../app/appData'

const { t } = useI18n()
const { tryToReconnect } = useSSE()
const modalConfirm = useAutoModal()

const { apps, system, importantYunohostUpgrade, pendingMigrations, lastAptUpdate, lastAppsCatalogUpdate } = await api
  .get<SystemUpdate>({ uri: 'update' })
  .then(({ apps, system, important_yunohost_upgrade, pending_migrations, last_apt_update, last_apps_catalog_update }) => {
    return {
      apps: ref(apps.filter(app => app.upgrade.status != 'up_to_date')),
      system: ref(system),
      importantYunohostUpgrade: important_yunohost_upgrade,
      pendingMigrations: !!pending_migrations.length,
      lastAptUpdate: secondsToHours(last_apt_update),
      lastAppsCatalogUpdate: secondsToHours(last_apps_catalog_update),
    }
  })
const preUpgrade = ref<
  | { apps: { id: string; name: string; notif: string }[]; hasNotifs: boolean }
  | undefined
>()

async function confirmAppsUpgrade(id?: string) {
  const appList = id ? [apps.value.find((app) => app.id === id)!] : apps.value.filter(app => app.upgrade.status == 'upgradable');
  const apps_ = appList.map((app) => ({
    id: app.id,
    name: app.name,
    notif: formatAppNotifs(app.upgrade.notifications.PRE_UPGRADE),
  }))
  preUpgrade.value = { apps: apps_, hasNotifs: apps_.some((app) => app.notif) }
}

async function performAppsUpgrade(ids: string[]) {
  const apps_ = ids.map((id) => apps.value.find((app) => app.id === id)!)
  const lastAppId = apps_[apps_.length - 1].id

  for (const app of apps_) {
    const continue_ = await api
      .put<Pick<SystemUpdate['apps'][number], 'notifications'>>({
        uri: `apps/${app.id}/upgrade`,
      })
      .then((response) => {
        const postMessage = formatAppNotifs(response.notifications.POST_UPGRADE)
        const isLast = app.id === lastAppId
        apps.value = apps.value.filter((a) => app.id !== a.id)

        if (postMessage) {
          const message =
            t('app.upgrade.notifs.post.alert') + '\n\n' + postMessage
          return modalConfirm(
            message,
            {
              title: t('app.upgrade.notifs.post.title', {
                name: app.name,
              }),
              /* i18n: app.upgrade.continue */
              okTitle: t(isLast ? 'ok' : 'app.upgrade.continue'),
              cancelTitle: t('app.upgrade.stop'),
            },
            { markdown: true, cancelable: !isLast },
          )
        } else {
          return true
        }
      })
    if (!continue_) break
  }
}

async function refreshUpdateCache() {
  api.put<SystemUpdate>({ uri: 'update/all' })
  .then(() => api.refetch())
}

async function performSystemUpgrade() {
  const confirmed = await modalConfirm(t('confirm_update_system'))
  if (!confirmed) return

  api.put({ uri: 'upgrade/system' }).then(() => {
    if (system.value.some(({ name }) => name.includes('yunohost'))) {
      tryToReconnect({
        origin: 'upgrade_system',
        initialDelay: 2000,
      })
    }
    system.value = []
  })
}
</script>

<template>
  <div>
    <!-- MIGRATIONS WARN -->
    <YAlert v-if="pendingMigrations" variant="warning" alert>
      <span v-html="$t('pending_migrations')" />
    </YAlert>

    <!-- MAJOR YUNOHOST UPGRADE WARN -->
    <YAlert v-if="importantYunohostUpgrade" variant="warning" alert>
      <span v-html="$t('important_yunohost_upgrade')" />
    </YAlert>

    <!-- BUTTON TO REFRESH APT CACHE / CATALOG -->
    <YAlert variant="info" class="mb-5">
      <ButtonWithDetails
        :label="t('update.refresh_cache')"
        icon="refresh"
        :details="t(
          lastAptUpdate > 12 || lastAppsCatalogUpdate > 12 ? 'update.very_stale_cache' :
          lastAptUpdate > 1 || lastAppsCatalogUpdate > 1 ? 'update.stale_cache' : 
          'update.ok_cache',
          {lastAptUpdate, lastAppsCatalogUpdate}
          )"
        :variant="info"
        :onclick="refreshUpdateCache"
      />
    </YAlert>

    <!-- SYSTEM UPGRADE -->
    <YCard v-if="lastAptUpdate < 12 && lastAppsCatalogUpdate < 12" :title="$t('system')" icon="server" no-body>
      <BAccordion v-if="Object.keys(system).length" flush free>
        <BAccordionItem
          v-for="( packages, category ) in system"
          :key="category"
          header-tag="h3"
          button-class="px-3 py-2"
        >
          <template #title>
            <span class="fw-bold">{{ category }}</span>
            <small class="ms-1">({{ packages.length }} {{ $t('items.packages', packages.length) }})</small>
          </template>
          <ul class="mb-0">
            <li v-for="{ name, current_version, new_version } in packages">
              {{ name }}
              <small class="text-secondary">
                {{ $t('from_to', [current_version, new_version]) }}
              </small>
            </li>
          </ul>
        </BAccordionItem>
      </BAccordion>

      <BCardBody v-else>
        <span class="text-success">
          <YIcon iname="check-circle" />
          {{ $t('system_packages_nothing') }}
        </span>
      </BCardBody>

      <template v-if="Object.keys(system).length" #buttons>
        <BButton
          v-t="'system_upgrade_all_packages_btn'"
          variant="success"
          @click="performSystemUpgrade()"
        />
      </template>
    </YCard>

    <!-- APPS UPGRADE -->
    <YCard v-if="lastAptUpdate < 12 && lastAppsCatalogUpdate < 12" :title="$t('applications')" icon="cubes" no-body>
      <BListGroup v-if="apps.length" flush>
        <BListGroupItem
          v-for="{ name, id, upgrade } in apps"
          :key="id"
          class="d-flex justify-content-between align-items-center ps-3 pe-1"
        >
          <BRow align-v="center" class="w-100">
          <BCol class="text-center text-md-start">
            <h5 class="mb-1">
              <span class="fw-bold">{{ name }}</span>
              <small>
                ({{ id }})
                <span class="text-secondary d-block d-sm-inline" v-if="upgrade.new_version">
                {{ $t('from_to', [upgrade.current_version, upgrade.new_version]) }}
                </span>
              </small>
            </h5>

            <div v-if="upgrade.specific_channel" class="text-start text-warning alert alert-warning py-1 my-1">
              <VueShowdown :markdown="upgrade.specific_channel_message" />
            </div>

            <div v-if="upgrade.status != 'upgradable'" class="text-start mt-1 mb-0">
              <VueShowdown :markdown="upgrade.message" />
            </div>
          </BCol>

          <BCol class="text-center text-md-end pe-0" cols="12" md="2">
          <BButton
            v-if="upgrade.status != 'url_required'"
            v-t="'system_upgrade_btn'"
            :variant="upgrade.status != 'upgradable' ? 'outline-secondary' : upgrade.specific_channel ? 'warning' : 'success'"
            :class="upgrade.status != 'upgradable' ? 'disabled' : ''"
            size="sm"
            @click="confirmAppsUpgrade(id)"
          />
          </BCol>
          </BRow>
        </BListGroupItem>
      </BListGroup>

      <BCardBody v-else>
        <span class="text-success">
          <YIcon iname="check-circle" /> {{ $t('system_apps_nothing') }}
        </span>
      </BCardBody>

      <template v-if="apps.length" #buttons>
        <BButton
          v-t="'system_upgrade_all_applications_btn'"
          variant="success"
          @click="confirmAppsUpgrade()"
        />
      </template>
    </YCard>

    <BModal
      v-if="preUpgrade"
      id="apps-pre-upgrade"
      centered
      :model-value="true"
      :title="$t('app.upgrade.confirm.title')"
      header-variant="warning"
      :ok-title="$t('system_upgrade_btn')"
      ok-variant="success"
      :cancel-title="$t('cancel')"
      @ok="performAppsUpgrade(preUpgrade.apps.map((app) => app.id))"
      @hide="preUpgrade = undefined"
    >
      <h3>
        {{ $t('app.upgrade.confirm.apps') }}
      </h3>
      <ul>
        <li v-for="{ name, id } in preUpgrade.apps" :key="id">
          {{ name }} ({{ id }})
        </li>
      </ul>

      <div v-if="preUpgrade.hasNotifs" class="mt-4">
        <h3>
          {{ $t('app.upgrade.notifs.pre.title') }}
        </h3>

        <YAlert variant="warning">
          {{ $t('app.upgrade.notifs.pre.alert') }}
        </YAlert>

        <div class="card-collapse-wrapper">
          <CardCollapse
            v-for="{ id, name, notif } in preUpgrade.apps"
            :id="`${id}-notifs`"
            :key="`${id}-notifs`"
            :title="name"
            visible
            flush
          >
            <BCardBody>
              <VueShowdown
                :markdown="notif"
                :options="{ headerLevelStart: 6 }"
              />
            </BCardBody>
          </CardCollapse>
        </div>
      </div>
    </BModal>
  </div>
</template>

<style scoped lang="scss">
.card-collapse-wrapper {
  border: $card-border-width solid $card-border-color;
  border-radius: $card-border-radius;

  .card {
    &:first-child {
      border-top: 0;
      border-top-right-radius: $card-border-radius;
      border-top-left-radius: $card-border-radius;
    }
    &:last-child {
      border-bottom: 0;
    }
  }
}
</style>
