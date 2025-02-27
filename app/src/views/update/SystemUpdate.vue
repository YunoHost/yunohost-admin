<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import CardCollapse from '@/components/CardCollapse.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { useSSE } from '@/composables/useSSE'
import type { SystemUpdate } from '@/types/core/api'
import { formatAppNotifs } from '../app/appData'

const { t } = useI18n()
const { tryToReconnect } = useSSE()
const modalConfirm = useAutoModal()

const { apps, system, importantYunohostUpgrade, pendingMigrations } = await api
  .put<SystemUpdate>({ uri: 'update/all' })
  .then(({ apps, system, important_yunohost_upgrade, pending_migrations }) => {
    return {
      apps: ref(apps),
      system: ref(system),
      importantYunohostUpgrade: important_yunohost_upgrade,
      pendingMigrations: !!pending_migrations.length,
    }
  })
const preUpgrade = ref<
  | { apps: { id: string; name: string; notif: string }[]; hasNotifs: boolean }
  | undefined
>()

async function confirmAppsUpgrade(id?: string) {
  const appList = id ? [apps.value.find((app) => app.id === id)!] : apps.value
  const apps_ = appList.map((app) => ({
    id: app.id,
    name: app.name,
    notif: formatAppNotifs(app.notifications.PRE_UPGRADE),
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

    <!-- SYSTEM UPGRADE -->
    <YCard :title="$t('system')" icon="server" no-body>
      <BListGroup v-if="system.length" flush>
        <BListGroupItem
          v-for="{ name, current_version, new_version } in system"
          :key="name"
        >
          <h5 class="m-0">
            {{ name }}
            <small class="text-secondary">
              ({{ $t('from_to', [current_version, new_version]) }})
            </small>
          </h5>
        </BListGroupItem>
      </BListGroup>

      <BCardBody v-else>
        <span class="text-success">
          <YIcon iname="check-circle" />
          {{ $t('system_packages_nothing') }}
        </span>
      </BCardBody>

      <template v-if="system.length" #buttons>
        <BButton
          v-t="'system_upgrade_all_packages_btn'"
          variant="success"
          @click="performSystemUpgrade()"
        />
      </template>
    </YCard>

    <!-- APPS UPGRADE -->
    <YCard :title="$t('applications')" icon="cubes" no-body>
      <BListGroup v-if="apps.length" flush>
        <BListGroupItem
          v-for="{ name, id, current_version, new_version } in apps"
          :key="id"
          class="d-flex justify-content-between align-items-center"
        >
          <h5 class="m-0">
            {{ name }}
            <small>
              ({{ id }})
              {{ $t('from_to', [current_version, new_version]) }}
            </small>
          </h5>

          <BButton
            v-t="'system_upgrade_btn'"
            variant="success"
            size="sm"
            @click="confirmAppsUpgrade(id)"
          />
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
