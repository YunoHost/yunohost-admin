<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'

const props = defineProps<{
  id: string
  name: string
}>()

const { t } = useI18n()
const router = useRouter()
const store = useStore()
const modalConfirm = useAutoModal()

const queries = [['GET', `backups/${props.name}?with_details`]]
const selected = ref<string[]>([])
const error = ref('')
const isValid = ref<boolean | null>(null)
const infos = ref()
const apps = ref()
const system = ref()

const hasBackupData = computed(() => {
  return !isEmptyValue(system.value) || !isEmptyValue(apps.value)
})

function formatHooks(hooks) {
  const data = {}
  Object.entries(hooks).forEach(([hook, { size }]) => {
    const groupId = hook.startsWith('conf_')
      ? 'adminjs_group_configuration'
      : hook
    if (groupId in data) {
      data[groupId].value.push(hook)
      data[groupId].description += ', ' + t('hook_' + hook)
      data[groupId].size += size
    } else {
      data[groupId] = {
        name: t('hook_' + groupId),
        value: [hook],
        description: t(groupId === hook ? `hook_${hook}_desc` : 'hook_' + hook),
        size,
      }
    }
  })
  return data
}

function onQueriesResponse(data) {
  infos.value = {
    name: props.name,
    created_at: data.created_at,
    size: data.size,
    path: data.path,
  }
  system.value = formatHooks(data.system)
  apps.value = data.apps

  toggleSelected()
}

function toggleSelected(select = true) {
  if (select) {
    selected.value = [...Object.keys(apps.value), ...Object.keys(system.value)]
  } else {
    selected.value = []
  }
}

async function restoreBackup() {
  const confirmed = await modalConfirm(
    t('confirm_restore', { name: props.name }),
  )
  if (!confirmed) return

  const data = { apps: [], system: [], force: '' }
  for (const item of selected.value) {
    if (item in system.value) {
      data.system = [...data.system, ...system.value[item].value]
    } else {
      data.apps.push(item)
    }
  }

  api
    .put(`backups/${props.name}/restore`, data, {
      key: 'backups.restore',
      name: props.name,
    })
    .then(() => {
      isValid.value = null
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      error.value = err.message
      isValid.value = false
    })
}

async function deleteBackup() {
  const confirmed = await modalConfirm(
    t('confirm_delete', { name: props.name }),
  )
  if (!confirmed) return

  api
    .delete(
      'backups/' + props.name,
      {},
      { key: 'backups.delete', name: props.name },
    )
    .then(() => {
      router.push({ name: 'backup-list', params: { id: props.id } })
    })
}

function downloadBackup() {
  const host = store.getters.host
  window.open(
    `https://${host}/yunohost/api/backups/${props.name}/download`,
    '_blank',
  )
}
</script>

<template>
  <ViewBase :queries="queries" @queries-response="onQueriesResponse">
    <!-- BACKUP INFO -->
    <YCard :title="$t('infos')" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <!-- DOWNLOAD ARCHIVE -->
        <BButton @click="downloadBackup" size="sm" variant="success">
          <YIcon iname="download" /> {{ $t('download') }}
        </BButton>

        <!-- DELETE ARCHIVE -->
        <BButton @click="deleteBackup" size="sm" variant="danger">
          <YIcon iname="trash-o" /> {{ $t('delete') }}
        </BButton>
      </template>

      <BRow
        v-for="(value, prop) in infos"
        :key="prop"
        no-gutters
        class="row-line"
      >
        <BCol md="3" xl="2">
          <strong>{{ $t(prop === 'name' ? 'id' : prop) }}</strong>
        </BCol>
        <BCol>
          <span v-if="prop === 'created_at'">{{ readableDate(value) }}</span>
          <span v-else-if="prop === 'size'">{{ humanSize(value) }}</span>
          <span v-else>{{ value }}</span>
        </BCol>
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
          size="sm"
          variant="outline-secondary"
          @click="toggleSelected()"
          v-t="'select_all'"
        />

        <BButton
          size="sm"
          variant="outline-secondary"
          @click="toggleSelected(false)"
          v-t="'select_none'"
        />
      </template>

      <BFormCheckboxGroup
        v-if="hasBackupData"
        v-model="selected"
        id="backup-select"
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
                <small class="text-secondary" v-if="item.size">
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
          <BAlert :modelValue="true" variant="danger" class="mb-0">
            {{ error }}
          </BAlert>
        </BFormInvalidFeedback>
      </BFormCheckboxGroup>

      <div v-else class="alert alert-warning mb-0">
        <YIcon iname="exclamation-triangle" /> {{ $t('archive_empty') }}
      </div>

      <!-- SUBMIT -->
      <template v-if="hasBackupData" #buttons>
        <BButton
          @click="restoreBackup"
          form="backup-restore"
          variant="success"
          v-t="'restore'"
          :disabled="selected.length === 0"
        />
      </template>
    </YCard>

    <template #skeleton>
      <CardInfoSkeleton :item-count="4" />
      <CardListSkeleton />
    </template>
  </ViewBase>
</template>
