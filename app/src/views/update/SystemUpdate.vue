<template>
  <view-base
    :queries="queries" queries-wait @queries-response="onQueriesResponse"
    skeleton="card-list-skeleton"
  >
    <!-- MIGRATIONS WARN -->
    <b-alert variant="warning" :show="migrationsNotDone">
      <icon iname="exclamation-triangle" /> <span v-html="$t('pending_migrations')" />
    </b-alert>

    <!-- SYSTEM UPGRADE -->
    <card :title="$t('system')" icon="server" no-body>
      <b-list-group v-if="system" flush>
        <b-list-group-item v-for="{ name, current_version, new_version } in system" :key="name">
          <h5 class="m-0">
            {{ name }}
            <small>({{ $t('from_to', [current_version, new_version]) }})</small>
          </h5>
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="system === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_packages_nothing') }}</span>
      </b-card-body>

      <template #buttons v-if="system">
        <b-button
          variant="success" v-t="'system_upgrade_all_packages_btn'"
          @click="performUpgrade({ type: 'system' })"
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
            @click="performUpgrade({ type: 'specific_app', id })"
          />
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="apps === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_apps_nothing') }}</span>
      </b-card-body>

      <template #buttons v-if="apps">
        <b-button
          variant="success" v-t="'system_upgrade_all_applications_btn'"
          @click="performUpgrade({ type: 'apps' })"
        />
      </template>
    </card>
  </view-base>
</template>

<script>
import api from '@/api'

export default {
  name: 'SystemUpdate',

  data () {
    return {
      queries: [
        ['GET', 'migrations?pending'],
        ['PUT', 'update/all', {}, 'update']
      ],
      // API data
      migrationsNotDone: undefined,
      system: undefined,
      apps: undefined
    }
  },

  methods: {
    onQueriesResponse ({ migrations }, { apps, system }) {
      this.migrationsNotDone = migrations.length !== 0
      this.apps = apps.length ? apps : null
      this.system = system.length ? system : null
    },

    async performUpgrade ({ type, id = null }) {
      const confirmMsg = this.$i18n.t('confirm_update_' + type, id ? { app: id } : {})
      const confirmed = await this.$askConfirmation(confirmMsg)
      if (!confirmed) return

      const uri = id !== null ? `apps/${id}/upgrade` : 'upgrade/' + type
      api.put(uri, {}, { key: 'upgrade.' + (id ? 'app' : type), app: id }).then(() => {
        if (id !== null) {
          this.apps = this.apps.filter(app => id !== app.id)
        } else if (type === 'apps') {
          this.apps = null
        } else {
          if (this.system.some(({ name }) => name.includes('yunohost'))) {
            this.$store.dispatch('TRY_TO_RECONNECT', { attemps: 1, origin: 'upgrade_system', initialDelay: 2000 })
          }
          this.system = null
        }
      })
    }
  }
}
</script>
