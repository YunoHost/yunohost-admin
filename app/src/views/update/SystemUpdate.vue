<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import api from '@/api'
import CardCollapse from '@/components/CardCollapse.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { useStoreGetters } from '@/store/utils'

const { t } = useI18n()
const store = useStore()
const modalConfirm = useAutoModal()
const { loading } = useInitialQueries([['PUT', 'update/all', {}, 'update']], {
  wait: true,
  onQueriesResponse,
})

const { dark } = useStoreGetters()
const system = ref()
const apps = ref()
const importantYunohostUpgrade = ref()
const pendingMigrations = ref()
const showPreUpgradeModal = ref(false)
const preUpgrade = ref({
  apps: [],
  notifs: [],
})

function onQueriesResponse({
  apps_,
  system_,
  important_yunohost_upgrade,
  pending_migrations,
}: any) {
  apps.value = apps_.length ? apps_ : null
  system.value = system_.length ? system_ : null
  // eslint-disable-next-line camelcase
  importantYunohostUpgrade.value = important_yunohost_upgrade
  pendingMigrations.value = pending_migrations.length !== 0
}

function formatAppNotifs(notifs) {
  return Object.keys(notifs).reduce((acc, key) => {
    return acc + '\n\n' + notifs[key]
  }, '')
}

async function confirmAppsUpgrade(id = null) {
  const appList = id ? [apps.value.find((app) => app.id === id)] : apps.value
  const apps_ = appList.map((app) => ({
    id: app.id,
    name: app.name,
    notif: app.notifications.PRE_UPGRADE
      ? formatAppNotifs(app.notifications.PRE_UPGRADE)
      : '',
  }))
  preUpgrade.value = { apps: apps_, hasNotifs: apps_.some((app) => app.notif) }
  showPreUpgradeModal.value = true
}

async function performAppsUpgrade(ids) {
  const apps_ = ids.map((id) => apps.value.find((app) => app.id === id))
  const lastAppId = apps_[apps_.length - 1].id

  for (const app of apps_) {
    const continue_ = await api
      .put(`apps/${app.id}/upgrade`, {}, { key: 'upgrade.app', app: app.name })
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
              okTitle: t(isLast ? 'ok' : 'app.upgrade.continue'),
              cancelTitle: t('app.upgrade.stop'),
            },
            { markdown: true, cancelable: !isLast },
          )
        } else {
          return Promise.resolve(true)
        }
      })
    if (!continue_) break
  }

  if (!apps.value.length) {
    apps.value = null
  }
}

async function performSystemUpgrade() {
  const confirmed = await modalConfirm(t('confirm_update_system'))
  if (!confirmed) return

  api.put('upgrade/system', {}, { key: 'upgrade.system' }).then(() => {
    if (system.value.some(({ name }) => name.includes('yunohost'))) {
      store.dispatch('TRY_TO_RECONNECT', {
        attemps: 1,
        origin: 'upgrade_system',
        initialDelay: 2000,
      })
    }
    system.value = null
  })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardListSkeleton">
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
      <BListGroup v-if="system" flush>
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

      <BCardBody v-else-if="system === null">
        <span class="text-success">
          <YIcon iname="check-circle" />
          {{ $t('system_packages_nothing') }}
        </span>
      </BCardBody>

      <template #buttons v-if="system">
        <BButton
          variant="success"
          v-t="'system_upgrade_all_packages_btn'"
          @click="performSystemUpgrade()"
        />
      </template>
    </YCard>

    <!-- APPS UPGRADE -->
    <YCard :title="$t('applications')" icon="cubes" no-body>
      <BListGroup v-if="apps" flush>
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
            variant="success"
            size="sm"
            v-t="'system_upgrade_btn'"
            @click="confirmAppsUpgrade(id)"
          />
        </BListGroupItem>
      </BListGroup>

      <BCardBody v-else-if="apps === null">
        <span class="text-success">
          <YIcon iname="check-circle" /> {{ $t('system_apps_nothing') }}
        </span>
      </BCardBody>

      <template #buttons v-if="apps">
        <BButton
          variant="success"
          v-t="'system_upgrade_all_applications_btn'"
          @click="confirmAppsUpgrade()"
        />
      </template>
    </YCard>

    <BModal
      v-model="showPreUpgradeModal"
      id="apps-pre-upgrade"
      :title="$t('app.upgrade.confirm.title')"
      header-bg-variant="warning"
      header-class="text-black"
      :ok-title="$t('system_upgrade_btn')"
      ok-variant="success"
      :cancel-title="$t('cancel')"
      @ok="performAppsUpgrade(preUpgrade.apps.map((app) => app.id))"
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
            :key="`${id}-notifs`"
            :title="name"
            :id="`${id}-notifs`"
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
  </ViewBase>
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
