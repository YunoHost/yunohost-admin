<template>
  <view-base :queries="queries" @queries-response="formatData" skeleton="card-list-skeleton">
    <!-- FIXME switch to <card-form> ? -->
    <card :title="$t('backup_create')" icon="archive" no-body>
      <b-form-checkbox-group
        v-model="selected"
        id="backup-select" name="backup-select" size="lg"
      >
        <b-list-group flush>
          <!-- SYSTEM HEADER -->
          <b-list-group-item class="d-flex align-items-sm-center flex-column flex-sm-row" variant="light">
            <h4 class="m-0">
              <icon iname="cube" /> {{ $t('system') }}
            </h4>

            <div class="ml-sm-auto mt-2 mt-sm-0">
              <b-button
                @click="toggleSelected(true, 'system')" v-t="'select_all'"
                size="sm" variant="outline-dark"
              />

              <b-button
                @click="toggleSelected(false, 'system')" v-t="'select_none'"
                size="sm" variant="outline-dark" class="ml-2"
              />
            </div>
          </b-list-group-item>

          <!-- SYSTEM ITEMS -->
          <b-list-group-item
            v-for="(item, partName) in system" :key="partName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5 class="font-weight-bold">
                {{ item.name }}
              </h5>
              <p class="m-0">
                {{ item.description }}
              </p>
            </div>

            <b-form-checkbox :value="partName" :aria-label="$t('check')" class="d-inline" />
          </b-list-group-item>

          <!-- APPS HEADER -->
          <b-list-group-item class="d-flex align-items-sm-center flex-column flex-sm-row" variant="light">
            <h4 class="m-0">
              <icon iname="cubes" /> {{ $t('applications') }}
            </h4>

            <div class="ml-sm-auto mt-2 mt-sm-0">
              <b-button
                @click="toggleSelected(true, 'apps')" v-t="'select_all'"
                size="sm" variant="outline-dark"
              />

              <b-button
                @click="toggleSelected(false, 'apps')" v-t="'select_none'"
                size="sm" variant="outline-dark" class="ml-2"
              />
            </div>
          </b-list-group-item>

          <!-- APPS ITEMS -->
          <b-list-group-item
            v-for="(item, appName) in apps" :key="appName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5 class="font-weight-bold">
                {{ item.name }} <small class="text-secondary">{{ item.id }}</small>
              </h5>
              <p class="m-0">
                {{ item.description }}
              </p>
            </div>

            <b-form-checkbox :value="appName" :aria-label="$t('check')" class="d-inline" />
          </b-list-group-item>
        </b-list-group>
      </b-form-checkbox-group>

      <!-- SUBMIT -->
      <template #buttons>
        <b-button
          @click="createBackup" v-t="'backup_action'"
          variant="success" :disabled="selected.length === 0"
        />
      </template>
    </card>
  </view-base>
</template>

<script>
import api from '@/api'

export default {
  name: 'BackupCreate',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: ['hooks/backup', 'apps?with_backup'],
      selected: [],
      // api data
      system: undefined,
      apps: undefined
    }
  },

  methods: {
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
    },

    formatData ({ hooks }, { apps }) {
      this.system = this.formatHooks(hooks)
      // transform app array into literal object to match hooks data structure
      this.apps = apps.reduce((obj, app) => {
        obj[app.id] = app
        return obj
      }, {})
      this.selected = [...Object.keys(this.system), ...Object.keys(this.apps)]
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
      const data = { apps: [], system: [] }
      for (const item of this.selected) {
        if (item in this.system) {
          data.system = [...data.system, ...this.system[item].value]
        } else {
          data.apps.push(item)
        }
      }

      api.post('backup', data).then(response => {
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    }
  }
}
</script>
