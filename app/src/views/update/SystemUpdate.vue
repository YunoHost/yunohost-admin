<template>
  <div class="system-update">
    <!-- FIXME add perform update button ? -->
    <!-- <div class="actions">
      <div class="buttons ml-auto">
        <b-button variant="success" @click="performUpdate">
          <icon iname="refresh" /> {{ $t('system_update') }}
        </b-button>
      </div>
    </div> -->

    <!-- MIGRATIONS WARN -->
    <b-alert variant="warning" :show="migrationsNotDone">
      <icon iname="exclamation-triangle" /> <span v-html="$t('pending_migrations')" />
    </b-alert>

    <!-- SYSTEM UPGRADE -->
    <b-card no-body>
      <template v-slot:header>
        <h2><icon iname="server" /> {{ $t('system') }}</h2>
      </template>

      <b-list-group v-if="system" flush>
        <b-list-group-item
          v-for="{ name, current_version, new_version } in system" :key="name"
        >
          <h5 class="m-0">{{ name }} <small>({{ $t('from_to', [current_version, new_version]) }})</small></h5>
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="system === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_packages_nothing') }}</span>
      </b-card-body>

      <template v-if="system" v-slot:footer>
        <div class="d-flex justify-content-end">
          <b-button
            v-b-modal.confirm-upgrade variant="success"
            v-t="'system_upgrade_all_packages_btn'"
            @click="action = ['system']"
          />
        </div>
      </template>
    </b-card>

    <!-- APPS UPGRADE -->
    <b-card no-body>
      <template v-slot:header>
        <h2><icon iname="cubes" /> {{ $t('applications') }}</h2>
      </template>

      <b-list-group v-if="apps" flush>
        <b-list-group-item
          v-for="{ label, id, current_version, new_version } in apps" :key="id"
          class="d-flex justify-content-between align-items-center"
        >
          <h5 class="m-0">{{ label }} <small>({{ id }}) {{ $t('from_to', [current_version, new_version]) }}</small></h5>

          <b-button
            v-b-modal.confirm-upgrade variant="success" size="sm"
            v-t="'system_upgrade_btn'"
            @click="action = ['specific_app', id]"
          />
        </b-list-group-item>
      </b-list-group>

      <b-card-body v-else-if="apps === null">
        <span class="text-success"><icon iname="check-circle" /> {{ $t('system_apps_nothing') }}</span>
      </b-card-body>

      <template v-if="apps" v-slot:footer>
        <div class="d-flex justify-content-end">
          <b-button
            v-b-modal.confirm-upgrade variant="success"
            v-t="'system_upgrade_all_applications_btn'"
            @click="action = ['apps']"
          />
        </div>
      </template>
    </b-card>

    <!-- UPGRADE CONFIRM MODAL -->
    <b-modal
      v-if="action"
      id="confirm-upgrade" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="performUpgrade" hide-header
    >
      {{ $t('confirm_update_' + action[0], action[1] ? { app: action[1] } : {}) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'SystemUpdate',

  data () {
    return {
      action: undefined,
      app: undefined,
      // api data
      migrationsNotDone: undefined,
      system: undefined,
      apps: undefined
    }
  },

  methods: {
    async fetchData () {
      api.get('migrations?pending').then(({ migrations }) => {
        this.migrationsNotDone = migrations.length !== 0
      })
    },

    performUpdate () {
      api.put('update').then(({ apps, system }) => {
        this.apps = apps.length ? apps : null
        this.system = system.length ? system : null
      })
    },

    performUpgrade () {
      const [type, id] = this.action
      const uri = type === 'specific_app'
        ? 'upgrade/apps?app=' + id
        : 'upgrade?' + type

      api.put(uri).then(() => {
        this.$router.push({ name: 'tool-logs' })
      })
    }
  },

  created () {
    // FIXME Do not perform directly the update ?
    this.performUpdate()
    this.fetchData()
  }
}
</script>
