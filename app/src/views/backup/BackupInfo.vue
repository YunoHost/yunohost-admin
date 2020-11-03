<template>
  <div class="backup-info" v-if="isReady">
    <!-- BACKUP INFO -->
    <b-card no-body>
      <b-card-header class="d-flex align-items-md-center flex-column flex-md-row">
        <div>
          <h2><icon iname="info-circle" /> {{ $t('infos') }}</h2>
        </div>

        <div class="ml-md-auto mt-2 mt-md-0">
          <!-- DOWNLOAD ARCHIVE -->
          <b-button size="sm" variant="success" @click="downloadBackup">
            <icon iname="download" /> {{ $t('download') }}
          </b-button>

          <!-- DELETE ARCHIVE -->
          <b-button
            size="sm" variant="danger" id="delete-backup"
            class="ml-2" v-b-modal.confirm-delete-backup
          >
            <icon iname="trash-o" /> {{ $t('delete') }}
          </b-button>
        </div>
      </b-card-header>

      <b-card-body>
        <b-row
          v-for="(value, prop) in info" :key="prop"
          no-gutters class="row-line"
        >
          <b-col cols="5" md="3" xl="3">
            <strong>{{ $t(prop === 'name' ? 'id' : prop) }}</strong>
            <span class="sep" />
          </b-col>
          <b-col>
            <span v-if="prop === 'created_at'">{{ value | readableDate }}</span>
            <span v-else-if="prop === 'size'">{{ value | humanSize }}</span>
            <span v-else>{{ value }}</span>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>

    <!-- BACKUP CONTENT -->
    <b-card no-body>
      <b-card-header class="d-flex align-items-md-center flex-column flex-md-row">
        <div>
          <h2><icon iname="archive" /> {{ $t('backup_content') }}</h2>
        </div>

        <div class="ml-md-auto mt-2 mt-md-0">
          <b-button
            size="sm" variant="outline-secondary"
            v-t="'select_all'"
            @click="toggleSelected()"
          />

          <b-button
            size="sm" variant="outline-secondary" class="ml-2"
            v-t="'select_none'"
            @click="toggleSelected(false)"
          />
        </div>
      </b-card-header>

      <b-form-checkbox-group
        v-if="hasItems" v-model="selected"
        id="backup-select" name="backup-select" size="lg"
        aria-describedby="backup-restore-feedback"
      >
        <b-list-group flush>
          <!-- SYSTEM PARTS -->
          <b-list-group-item
            v-for="(item, partName) in systemParts" :key="partName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5>{{ item.name }} <small v-if="item.size">({{ item.size | humanSize }})</small></h5>
              <p class="mb-0">
                {{ item.description }}
              </p>
            </div>

            <b-form-checkbox :value="partName" :aria-label="$t('check')" />
          </b-list-group-item>

          <!-- APPS -->
          <b-list-group-item
            v-for="(item, appName) in apps" :key="appName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5>{{ item.name }} <small>{{ appName }} ({{ item.size | humanSize }})</small></h5>
              <p class="mb-0">
                {{ $t('version') }} {{ item.version }}
              </p>
            </div>

            <b-form-checkbox :value="appName" :aria-label="$t('check')" />
          </b-list-group-item>
        </b-list-group>

        <b-form-invalid-feedback id="backup-restore-feedback" :state="isValid">
          <b-alert variant="danger" show class="mb-0">
            {{ error }}
          </b-alert>
        </b-form-invalid-feedback>
      </b-form-checkbox-group>

      <b-alert
        v-else
        variant="warning" class="mb-0" show
      >
        <icon iname="exclamation-triangle" /> {{ $t('archive_empty') }}
      </b-alert>

      <!-- SUBMIT -->
      <template v-if="hasItems" v-slot:footer>
        <div class="d-flex justify-content-end">
          <b-button
            v-b-modal.confirm-restore-backup form="backup-restore" variant="success"
            v-t="'restore'" :disabled="selected.length === 0"
          />
        </div>
      </template>
    </b-card>

    <!-- RESTORE BACKUP MODAL -->
    <b-modal
      id="confirm-restore-backup" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="restoreBackup" hide-header
    >
      {{ $t('confirm_restore', { name }) }}
    </b-modal>

    <!-- DELETE BACKUP MODAL -->
    <b-modal
      id="confirm-delete-backup" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="deleteBackup" hide-header
    >
      {{ $t('confirm_delete', { name }) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import { readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'

export default {
  name: 'BackupInfo',

  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      isReady: false,
      restore: false,
      selected: [],
      error: '',
      isValid: null,
      // api data
      info: {
        name: this.name,
        created_at: undefined,
        size: undefined,
        path: undefined
      },
      apps: undefined,
      systemParts: undefined
    }
  },

  filters: {
    readableDate,
    humanSize
  },

  methods: {
    fetchData () {
      api.get(`backup/archives/${this.name}?with_details`).then((data) => {
        this.info.created_at = data.created_at
        this.info.size = data.size
        this.info.path = data.path
        this.hasItems = Object.keys(data.system).length !== 0 || Object.keys(data.apps).length !== 0
        this.systemParts = this.formatHooks(data.system)
        this.apps = data.apps

        this.toggleSelected()
        this.isReady = true
      })
    },

    toggleSelected (select = true) {
      if (select) {
        this.selected = [
          ...Object.keys(this.apps),
          ...Object.keys(this.systemParts)
        ]
      } else {
        this.selected = []
      }
    },

    restoreBackup () {
      const data = {
        apps: [],
        system: [],
        force: ''
      }

      for (const item of this.selected) {
        if (item in this.systemParts) {
          data.system = [...data.system, ...this.systemParts[item].value]
        } else {
          data.apps.push(item)
        }
      }

      api.post('backup/restore/' + this.name, data).then(response => {
        // FIXME display ws messages
        this.isValid = null
      }).catch(err => {
        // FIXME some errors may be sent by the websocket (yunohost api error for exemple)
        this.error = err.message
        this.isValid = false
      })
    },

    deleteBackup () {
      api.delete('backup/archives/' + this.name).then(() => {
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    },

    downloadBackup () {
      const host = this.$store.getters.host
      window.open(`https://${host}/yunohost/api/backup/download/${this.name}`, '_blank')
    },

    formatHooks (hooks) {
      const data = {}
      Object.entries(hooks).forEach(([hook, { size }]) => {
        const groupId = hook.startsWith('conf_') ? 'adminjs_group_configuration' : hook
        if (groupId in data) {
          data[groupId].value.push(hook)
          data[groupId].description += ', ' + this.$i18n.t('hook_' + hook)
          data[groupId].size += size
        } else {
          data[groupId] = {
            name: this.$i18n.t('hook_' + groupId),
            value: [hook],
            description: this.$i18n.t(groupId === hook ? `hook_${hook}_desc` : 'hook_' + hook),
            size
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
