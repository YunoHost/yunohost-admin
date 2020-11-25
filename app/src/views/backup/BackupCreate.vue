<template>
  <div class="backup-create" v-if="isReady">
    <b-card no-body>
      <template v-slot:header>
        <h2><icon iname="archive" /> {{ $t('backup_create') }}</h2>
      </template>

      <b-form-checkbox-group
        v-model="selected"
        id="backup-select" name="backup-select" size="lg"
        aria-describedby="backup-restore-feedback"
      >
        <b-list-group flush>
          <!-- SYSTEM TITLE -->
          <b-list-group-item class="d-flex align-items-md-center flex-column flex-md-row" variant="dark">
            <div>
              <h4 class="mb-0"><icon iname="cube" /> {{ $t('system') }}</h4>
            </div>

            <div class="ml-md-auto mt-2 mt-md-0">
              <b-button
                size="sm" variant="light"
                v-t="'select_all'" @click="toggleSelected(true, 'hooks')"
              />

              <b-button
                size="sm" variant="light" class="ml-2"
                v-t="'select_none'" @click="toggleSelected(false, 'hooks')"
              />
            </div>
          </b-list-group-item>

          <!-- SYSTEM ITEMS -->
          <b-list-group-item
            v-for="(item, partName) in hooks" :key="partName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5>{{ item.name }} </h5>
              <p class="mb-0">{{ item.description }}</p>
            </div>

            <b-form-checkbox :value="partName" :aria-label="$t('check')" class="d-inline" />
          </b-list-group-item>

          <!-- APPS TITLE -->
          <b-list-group-item class="d-flex align-items-md-center flex-column flex-md-row" variant="dark">
            <div>
              <h4 class="mb-0"><icon iname="cubes" /> {{ $t('applications') }}</h4>
            </div>

            <div class="ml-md-auto mt-2 mt-md-0">
              <b-button
                size="sm" variant="light"
                v-t="'select_all'" @click="toggleSelected(true, 'apps')"
              />

              <b-button
                size="sm" variant="light" class="ml-2"
                v-t="'select_none'" @click="toggleSelected(false, 'apps')"
              />
            </div>
          </b-list-group-item>
          <!-- APPS ITEMS -->
          <b-list-group-item
            v-for="(item, appName) in apps" :key="appName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5>{{ item.name }} <small>{{ item.id }}</small></h5>
              <p class="mb-0">{{ item.description }}</p>
            </div>

            <b-form-checkbox :value="appName" :aria-label="$t('check')" class="d-inline"/>
          </b-list-group-item>
        </b-list-group>
      </b-form-checkbox-group>

      <!-- SUBMIT -->
      <template v-slot:footer>
        <div class="d-flex justify-content-end">
          <b-button
            @click="createBackup" variant="success"
            v-t="'backup_action'" :disabled="selected.length === 0"
          />
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
import api from '@/api'


export default {
  name: 'BackupCreate',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      isReady: false,
      selected: [],
      // api data
      hooks: undefined,
      apps: undefined
    }
  },

  methods: {
    fetchData () {
      api.getAll(['hooks/backup', 'apps?with_backup']).then(([{ hooks }, { apps }]) => {
        this.hooks = this.formatHooks(hooks)
        // transform app array into literal object to match hooks data structure
        this.apps = apps.reduce((obj, app) => {
          obj[app.id] = app
          return obj
        }, {})
        this.selected = [...Object.keys(this.hooks), ...Object.keys(this.apps)]
        this.isReady = true
      })
    },

    toggleSelected (select, type) {
      if (select) {
        const toSelect = Object.keys(this[type]).filter(item => !this.selected.includes(item))
        this.selected = [...this.selected, ...toSelect]
      } else {
        const toUnselect = Object.keys(this[type])
        this.selected = this.selected.filter(selected => !toUnselect.includes(selected))
      }
    },

    createBackup () {
      const data = {
        apps: [],
        system: []
      }

      for (const item of this.selected) {
        if (item in this.hooks) {
          data.system = [...data.system, ...this.hooks[item].value]
        } else {
          data.apps.push(item)
        }
      }

      api.post('backup', data).then(response => {
        // FIXME display ws messages
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    },

    formatHooks (hooks) {
      const data = {}
      hooks.forEach(hook => {
        const groupId = hook.startsWith('conf_') ? 'adminjs_group_configuration' : hook
        if (groupId in data) {
          data[groupId].value.push(hook)
          data[groupId].description += ', ' + this.$i18n.t('hook_' + hook)
        } else {
          data[groupId] = {
            name: this.$i18n.t('hook_' + groupId),
            value: [hook],
            description: this.$i18n.t(groupId === hook ? `hook_${hook}_desc` : 'hook_' + hook)
          }
        }
      })
      return data
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
