<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInfos } from '@/composables/useInfos'
import { isEmptyValue } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'
import type { BackupInfo } from '@/types/core/api'
import { formatBackupSystem, parseBackupForm } from './backupData'

const props = defineProps<{
  id: string
  name: string
}>()

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

const { infos, system, apps } = await api
  .get<BackupInfo>({ uri: `backups/${props.name}?with_details` })
  .then((backup) => {
    return {
      system: formatBackupSystem(backup.system),
      apps: backup.apps,
      infos: {
        id: props.name,
        created_at: readableDate(backup.created_at),
        size: humanSize(backup.size),
        path: backup.path,
      },
    }
  })

const allKeys = [...Object.keys(apps), ...Object.keys(system)]
const selected = ref(allKeys)
const serverError = ref('')
const isValid = ref<boolean | null>(null)

const hasBackupData = computed(() => {
  return !isEmptyValue(system) || !isEmptyValue(apps)
})

function toggleSelected(select = true) {
  selected.value = select ? allKeys : []
}

async function restoreBackup() {
  const confirmed = await modalConfirm(
    t('confirm_restore', { name: props.name }),
  )
  if (!confirmed) return

  const data = parseBackupForm(selected.value, system)
  api
    .put({
      uri: `backups/${props.name}/restore`,
      // FIXME force?
      data: { ...data, force: '' },
      humanKey: { key: 'backups.restore', name: props.name },
    })
    .then(() => {
      isValid.value = null
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      serverError.value = err.message
      isValid.value = false
    })
}

async function deleteBackup() {
  const confirmed = await modalConfirm(
    t('confirm_delete', { name: props.name }),
  )
  if (!confirmed) return

  api
    .delete({
      uri: 'backups/' + props.name,
      humanKey: { key: 'backups.delete', name: props.name },
    })
    .then(() => {
      router.push({ name: 'backup-list', params: { id: props.id } })
    })
}

function downloadBackup() {
  const { host } = useInfos()
  window.open(
    `https://${host.value}/yunohost/api/backups/${props.name}/download`,
    '_blank',
  )
}
</script>

<template>
  <div>
    <!-- BACKUP INFO -->
    <YCard :title="$t('infos')" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <!-- DOWNLOAD ARCHIVE -->
        <BButton size="sm" variant="success" @click="downloadBackup">
          <YIcon iname="download" /> {{ $t('download') }}
        </BButton>

        <!-- DELETE ARCHIVE -->
        <BButton size="sm" variant="danger" @click="deleteBackup">
          <YIcon iname="trash-o" /> {{ $t('delete') }}
        </BButton>
      </template>

      <BRow
        v-for="(text, prop) in infos"
        :key="prop"
        no-gutters
        class="row-line"
      >
        <BCol md="3" xl="2">
          <strong>{{ $t(prop) }}</strong>
        </BCol>
        <BCol>{{ text }}</BCol>
      </BRow>
    </YCard>

    <!-- BACKUP CONTENT -->
    <!-- FIXME switch to <CardForm> ? -->
    <YCard
      :title="$t('backup_content')"
      icon="archive"
      no-body
      button-unbreak="sm"
    >
      <template #header-buttons>
        <BButton
          v-t="'select_all'"
          size="sm"
          variant="outline-secondary"
          @click="toggleSelected()"
        />

        <BButton
          v-t="'select_none'"
          size="sm"
          variant="outline-secondary"
          @click="toggleSelected(false)"
        />
      </template>

      <BFormCheckboxGroup
        v-if="hasBackupData"
        id="backup-select"
        v-model="selected"
        name="backup-select"
        size="lg"
        aria-describedby="backup-restore-feedback"
      >
        <BListGroup flush>
          <!-- SYSTEM PARTS -->
          <BListGroupItem
            v-for="(item, partName) in system"
            :key="partName"
            class="d-flex justify-content-between align-items-center pe-0"
          >
            <div class="me-2">
              <h5 class="fw-bold">
                {{ item.name }}
                <small v-if="item.size" class="text-secondary">
                  ({{ humanSize(item.size) }})
                </small>
              </h5>
              <p class="m-0">
                {{ item.description }}
              </p>
            </div>

            <BFormCheckbox :value="partName" :aria-label="$t('check')" />
          </BListGroupItem>

          <!-- APPS -->
          <BListGroupItem
            v-for="(item, appName) in apps"
            :key="appName"
            class="d-flex justify-content-between align-items-center pe-0"
          >
            <div class="me-2">
              <h5 class="fw-bold">
                {{ item.name }}
                <small class="text-secondary">
                  {{ appName }} ({{ humanSize(item.size) }})
                </small>
              </h5>
              <p class="m-0">{{ $t('version') }} {{ item.version }}</p>
            </div>

            <BFormCheckbox :value="appName" :aria-label="$t('check')" />
          </BListGroupItem>
        </BListGroup>

        <BFormInvalidFeedback id="backup-restore-feedback" :state="isValid">
          <YAlert alert variant="danger" class="mb-0">
            {{ serverError }}
          </YAlert>
        </BFormInvalidFeedback>
      </BFormCheckboxGroup>

      <div v-else class="alert alert-warning mb-0">
        <YIcon iname="exclamation-triangle" /> {{ $t('archive_empty') }}
      </div>

      <!-- SUBMIT -->
      <template v-if="hasBackupData" #buttons>
        <BButton
          v-t="'restore'"
          form="backup-restore"
          variant="success"
          :disabled="selected.length === 0"
          @click="restoreBackup"
        />
      </template>
    </YCard>
  </div>
</template>
