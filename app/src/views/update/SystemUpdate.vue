<template>
  <view-base
    :queries="queries" queries-wait @queries-response="onQueriesResponse"
    skeleton="card-list-skeleton"
  >
    <!-- MIGRATIONS WARN -->
    <yuno-alert v-if="pendingMigrations" variant="warning" alert>
      <span v-html="$t('pending_migrations')" />
    </yuno-alert>

    <!-- MAJOR YUNOHOST UPGRADE WARN -->
    <yuno-alert v-if="importantYunohostUpgrade" variant="warning" alert>
      <span v-html="$t('important_yunohost_upgrade')" />
    </yuno-alert>

    <!-- SYSTEM UPGRADE -->
    <card :title="$t('system')" icon="server" no-body>
      <b-list-group v-if="system" flush>
        <b-list-group-item v-for="{ name, current_version, new_version } in system" :key="name">
          <h5 class="m-0">
            {{ name }}
            <small class="text-secondary">({{ $t('from_to', [current_version, new_version]) }})</small>
          </h5>
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="system === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_packages_nothing') }}</span>
      </b-card-body>

      <template #buttons v-if="system">
        <b-button
          variant="success" v-t="'system_upgrade_all_packages_btn'"
          @click="performSystemUpgrade()"
        />
      </template>
    </card>

    <!-- APPS UPGRADE -->
    <card :title="$t('applications')" icon="cubes" no-body>
      <b-list-group v-if="apps" flush>
        <b-list-group-item
          v-for="{ name, id, current_version, new_version } in apps" :key="id"
          class="d-flex justify-content-between align-items-center"
        >
          <h5 class="m-0">
            {{ name }}
            <small>({{ id }}) {{ $t('from_to', [current_version, new_version]) }}</small>
          </h5>

          <b-button
            variant="success" size="sm" v-t="'system_upgrade_btn'"
            @click="confirmAppsUpgrade(id)"
          />
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="apps === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_apps_nothing') }}</span>
      </b-card-body>

      <template #buttons v-if="apps">
        <b-button
          variant="success" v-t="'system_upgrade_all_applications_btn'"
          @click="confirmAppsUpgrade()"
        />
      </template>
    </card>

    <b-modal
      id="apps-pre-upgrade"
      :title="$t('app.upgrade.confirm.title')"
      header-bg-variant="warning"
      :header-class="theme ? 'text-white' : 'text-black'"
      :ok-title="$t('system_upgrade_btn')" ok-variant="success"
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

        <yuno-alert variant="warning">
          {{ $t('app.upgrade.notifs.pre.alert' ) }}
        </yuno-alert>

        <div class="card-collapse-wrapper">
          <card-collapse
            v-for="{ id, name, notif } in preUpgrade.apps" :key="`${id}-notifs`"
            :title="name" :id="`${id}-notifs`"
            visible flush
          >
            <b-card-body>
              <vue-showdown :markdown="notif" flavor="github" :options="{ headerLevelStart: 6 }" />
            </b-card-body>
          </card-collapse>
        </div>
      </div>
    </b-modal>
  </view-base>
</template>

<script>
import api from '@/api'
import { mapGetters } from 'vuex'

import CardCollapse from '@/components/CardCollapse.vue'

export default {
  name: 'SystemUpdate',

  components: {
    CardCollapse
  },

  data () {
    return {
      queries: [
        ['PUT', 'update/all', {}, 'update']
      ],
      // API data
      system: undefined,
      apps: undefined,
      importantYunohostUpgrade: undefined,
      pendingMigrations: undefined,
      preUpgrade: {
        apps: [],
        notifs: []
      }
    }
  },

  computed: {
    ...mapGetters(['theme'])
  },

  methods: {
    // eslint-disable-next-line camelcase
    onQueriesResponse ({ apps, system, important_yunohost_upgrade, pending_migrations }) {
      this.apps = apps.length ? apps : null
      this.system = system.length ? system : null
      // eslint-disable-next-line camelcase
      this.importantYunohostUpgrade = important_yunohost_upgrade
      this.pendingMigrations = pending_migrations.length !== 0
    },

    formatAppNotifs (notifs) {
      return Object.keys(notifs).reduce((acc, key) => {
        return acc + '\n\n' + notifs[key]
      }, '')
    },

    async confirmAppsUpgrade (id = null) {
      const appList = id ? [this.apps.find((app) => app.id === id)] : this.apps
      const apps = appList.map((app) => ({
        id: app.id,
        name: app.name,
        notif: app.notifications.PRE_UPGRADE
          ? this.formatAppNotifs(app.notifications.PRE_UPGRADE)
          : ''
      }))
      this.preUpgrade = { apps, hasNotifs: apps.some((app) => app.notif) }
      this.$bvModal.show('apps-pre-upgrade')
    },

    async performAppsUpgrade (ids) {
      const apps = ids.map((id) => this.apps.find((app) => app.id === id))
      const lastAppId = apps[apps.length - 1].id

      for (const app of apps) {
        const continue_ = await api.put(
          `apps/${app.id}/upgrade`, {}, { key: 'upgrade.app', app: app.name }
        ).then((response) => {
          const postMessage = this.formatAppNotifs(response.notifications.POST_UPGRADE)
          const isLast = app.id === lastAppId
          this.apps = this.apps.filter((a) => app.id !== a.id)

          if (postMessage) {
            const message = this.$i18n.t('app.upgrade.notifs.post.alert') + '\n\n' + postMessage
            return this.$askMdConfirmation(message, {
              title: this.$i18n.t('app.upgrade.notifs.post.title', { name: app.name }),
              okTitle: this.$i18n.t(isLast ? 'ok' : 'app.upgrade.continue'),
              cancelTitle: this.$i18n.t('app.upgrade.stop')
            }, isLast)
          } else {
            return Promise.resolve(true)
          }
        })
        if (!continue_) break
      }

      if (!this.apps.length) {
        this.apps = null
      }
    },

    async performSystemUpgrade () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_update_system'))
      if (!confirmed) return

      api.put('upgrade/system', {}, { key: 'upgrade.system' }).then(() => {
        if (this.system.some(({ name }) => name.includes('yunohost'))) {
          this.$store.dispatch('TRY_TO_RECONNECT', { attemps: 1, origin: 'upgrade_system', initialDelay: 2000 })
        }
        this.system = null
      })
    }
  }
}
</script>

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
