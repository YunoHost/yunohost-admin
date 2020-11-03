<template>
  <div class="backup-info" v-if="isReady">
    <!-- BACKUP INFO -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="info-circle" /> {{ $t('infos') }}</h2>
      </template>

      <dl>
        <dt v-t="'id'" />
        <dd>{{ name }}</dd>
        <hr>

        <dt v-t="'created_at'" />
        <dd>{{ createdAt | readableDate }}</dd>
        <hr>

        <dt v-t="'size'" />
        <dd>{{ size | humanSize }}</dd>
        <hr>

        <dt v-t="'path'" />
        <dd>{{ path }}</dd>
        <hr>
      </dl>
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
              <p class="mb-0">{{ item.description }}</p>
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
              <p class="mb-0">{{ $t('version') }} {{ item.version }}</p>
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

    <!-- DELETE ARCHIVE -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="wrench" /> {{ $t('operations') }}</h2>
      </template>

      <b-form-group label-cols="auto" :label="$t('backup_archive_delete')" label-for="delete-backup">
        <b-button
          variant="danger" id="delete-backup" v-b-modal.confirm-delete-backup
        >
          <icon iname="trash-o" /> {{ $t('delete') }}
        </b-button>
      </b-form-group>
    </b-card>

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
      createdAt: undefined,
      size: undefined,
      path: undefined,
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
        this.createdAt = data.created_at
        this.size = data.size
        this.path = data.path
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
