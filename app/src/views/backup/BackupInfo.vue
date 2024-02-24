<template>
  <ViewBase :queries="queries" @queries-response="onQueriesResponse">
    <!-- BACKUP INFO -->
    <Card :title="$t('infos')" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <!-- DOWNLOAD ARCHIVE -->
        <BButton @click="downloadBackup" size="sm" variant="success">
          <Icon iname="download" /> {{ $t('download') }}
        </BButton>

        <!-- DELETE ARCHIVE -->
        <BButton @click="deleteBackup" size="sm" variant="danger">
          <Icon iname="trash-o" /> {{ $t('delete') }}
        </BButton>
      </template>

      <BRow
        v-for="(value, prop) in infos" :key="prop"
        no-gutters class="row-line"
      >
        <BCol md="3" xl="2">
          <strong>{{ $t(prop === 'name' ? 'id' : prop) }}</strong>
        </BCol>
        <BCol>
          <span v-if="prop === 'created_at'">{{ value | readableDate }}</span>
          <span v-else-if="prop === 'size'">{{ value | humanSize }}</span>
          <span v-else>{{ value }}</span>
        </BCol>
      </BRow>
    </Card>

    <!-- BACKUP CONTENT -->
    <!-- FIXME switch to <CardForm> ? -->
    <Card
      :title="$t('backup_content')" icon="archive"
      no-body button-unbreak="sm"
    >
      <template #header-buttons>
        <BButton
          size="sm" variant="outline-secondary"
          @click="toggleSelected()" v-t="'select_all'"
        />

        <BButton
          size="sm" variant="outline-secondary"
          @click="toggleSelected(false)" v-t="'select_none'"
        />
      </template>

      <BFormCheckboxGroup
        v-if="hasBackupData" v-model="selected"
        id="backup-select" name="backup-select" size="lg"
        aria-describedby="backup-restore-feedback"
      >
        <BListGroup flush>
          <!-- SYSTEM PARTS -->
          <BListGroupItem
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

            <BFormCheckbox :value="partName" :aria-label="$t('check')" />
          </BListGroupItem>

          <!-- APPS -->
          <BListGroupItem
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

            <BFormCheckbox :value="appName" :aria-label="$t('check')" />
          </BListGroupItem>
        </BListGroup>

        <BFormInvalidFeedback id="backup-restore-feedback" :state="isValid">
          <BAlert variant="danger" class="mb-0">
            {{ error }}
          </BAlert>
        </BFormInvalidFeedback>
      </BFormCheckboxGroup>

      <div v-else class="alert alert-warning mb-0">
        <Icon iname="exclamation-triangle" /> {{ $t('archive_empty') }}
      </div>

      <!-- SUBMIT -->
      <template v-if="hasBackupData" #buttons>
        <BButton
          @click="restoreBackup" form="backup-restore" variant="success"
          v-t="'restore'" :disabled="selected.length === 0"
        />
      </template>
    </Card>

    <template #skeleton>
      <CardInfoSkeleton :item-count="4" />
      <CardListSkeleton />
    </template>
  </ViewBase>
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
      queries: [
        ['GET', `backups/${this.name}?with_details`]
      ],
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

    onQueriesResponse (data) {
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

      api.put(
        `backups/${this.name}/restore`, data, { key: 'backups.restore', name: this.name }
      ).then(() => {
        this.isValid = null
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        this.error = err.message
        this.isValid = false
      })
    },

    async deleteBackup () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name: this.name }))
      if (!confirmed) return

      api.delete(
        'backups/' + this.name, {}, { key: 'backups.delete', name: this.name }
      ).then(() => {
        this.$router.push({ name: 'backup-list', params: { id: this.id } })
      })
    },

    downloadBackup () {
      const host = this.$store.getters.host
      window.open(`https://${host}/yunohost/api/backups/${this.name}/download`, '_blank')
    }
  },

  filters: {
    readableDate,
    humanSize
  }
}
</script>
