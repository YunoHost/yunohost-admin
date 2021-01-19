<template>
  <view-base :queries="queries" @queries-response="formatBackupData">
    <!-- BACKUP INFO -->
    <card :title="$t('infos')" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <!-- DOWNLOAD ARCHIVE -->
        <b-button @click="downloadBackup" size="sm" variant="success">
          <icon iname="download" /> {{ $t('download') }}
        </b-button>

        <!-- DELETE ARCHIVE -->
        <b-button @click="deleteBackup" size="sm" variant="danger">
          <icon iname="trash-o" /> {{ $t('delete') }}
        </b-button>
      </template>

      <b-row
        v-for="(value, prop) in infos" :key="prop"
        no-gutters class="row-line"
      >
        <b-col md="3" xl="2">
          <strong>{{ $t(prop === 'name' ? 'id' : prop) }}</strong>
        </b-col>
        <b-col>
          <span v-if="prop === 'created_at'">{{ value | readableDate }}</span>
          <span v-else-if="prop === 'size'">{{ value | humanSize }}</span>
          <span v-else>{{ value }}</span>
        </b-col>
      </b-row>
    </card>

    <!-- BACKUP CONTENT -->
    <!-- FIXME switch to <card-form> ? -->
    <card
      :title="$t('backup_content')" icon="archive"
      no-body button-unbreak="sm"
    >
      <template #header-buttons>
        <b-button
          size="sm" variant="outline-secondary"
          @click="toggleSelected()" v-t="'select_all'"
        />

        <b-button
          size="sm" variant="outline-secondary"
          @click="toggleSelected(false)" v-t="'select_none'"
        />
      </template>

      <b-form-checkbox-group
        v-if="hasBackupData" v-model="selected"
        id="backup-select" name="backup-select" size="lg"
        aria-describedby="backup-restore-feedback"
      >
        <b-list-group flush>
          <!-- SYSTEM PARTS -->
          <b-list-group-item
            v-for="(item, partName) in system" :key="partName"
            class="d-flex justify-content-between align-items-center pr-0"
          >
            <div class="mr-2">
              <h5 class="font-weight-bold">
                {{ item.name }} <small class="text-secondary" v-if="item.size">({{ item.size | humanSize }})</small>
              </h5>
              <p class="m-0">
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
              <h5 class="font-weight-bold">
                {{ item.name }} <small class="text-secondary">{{ appName }} ({{ item.size | humanSize }})</small>
              </h5>
              <p class="m-0">
                {{ $t('version') }} {{ item.version }}
              </p>
            </div>

            <b-form-checkbox :value="appName" :aria-label="$t('check')" />
          </b-list-group-item>
        </b-list-group>

        <b-form-invalid-feedback id="backup-restore-feedback" :state="isValid">
          <b-alert variant="danger" class="mb-0">
            {{ error }}
          </b-alert>
        </b-form-invalid-feedback>
      </b-form-checkbox-group>

      <div v-else class="alert alert-warning mb-0">
        <icon iname="exclamation-triangle" /> {{ $t('archive_empty') }}
      </div>

      <!-- SUBMIT -->
      <template v-if="hasBackupData" #buttons>
        <b-button
          @click="restoreBackup" form="backup-restore" variant="success"
          v-t="'restore'" :disabled="selected.length === 0"
        />
      </template>
    </card>

    <template #skeleton>
      <card-info-skeleton :item-count="4" />
      <card-list-skeleton />
    </template>
  </view-base>
</template>

<script>
import api from '@/api'
import { readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'
import { isEmptyValue } from '@/helpers/commons'

export default {
  name: 'BackupInfo',

  props: {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [`backup/archives/${this.name}?with_details`],
      selected: [],
      error: '',
      isValid: null,
      // api data
      infos: undefined,
      apps: undefined,
      system: undefined
    }
  },

  computed: {
    hasBackupData () {
      return !isEmptyValue(this.system) || !isEmptyValue(this.apps)
    }
  },

  methods: {
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
    },

    formatBackupData (data) {
      this.infos = {
        name: this.name,
        created_at: data.created_at,
        size: data.size,
        path: data.path
      }
      this.system = this.formatHooks(data.system)
      this.apps = data.apps

      this.toggleSelected()
    },

    toggleSelected (select = true) {
      if (select) {
        this.selected = [
          ...Object.keys(this.apps),
          ...Object.keys(this.system)
        ]
      } else {
        this.selected = []
      }
    },

    async restoreBackup () {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_restore', { name: this.name })
      )
      if (!confirmed) return

      const data = { apps: [], system: [], force: '' }
      for (const item of this.selected) {
        if (item in this.system) {
          data.system = [...data.system, ...this.system[item].value]
        } else {
          data.apps.push(item)
        }
      }

      api.post('backup/restore/' + this.name, data).then(response => {
        this.isValid = null
      }).catch(err => {
        this.error = err.message
        this.isValid = false
      })
    },

    async deleteBackup () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name: this.name }))
      if (!confirmed) return

      api.delete('backup/archives/' + this.name).then(() => {
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    },

    downloadBackup () {
      const host = this.$store.getters.host
      window.open(`https://${host}/yunohost/api/backup/download/${this.name}`, '_blank')
    }
  },

  filters: {
    readableDate,
    humanSize
  }
}
</script>
