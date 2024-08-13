<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api'
import { fromEntries } from '@/helpers/commons'
import type { BackupAppList, BackupHooksList } from '@/types/core/api'
import { formatBackupSystem, parseBackupForm } from './backupData'

const props = defineProps<{
  id: string
}>()

const router = useRouter()

const [system, apps] = await api
  .fetchAll<
    [BackupHooksList, BackupAppList]
  >([{ uri: 'hooks/backup' }, { uri: 'apps?with_backup' }])
  .then(([{ hooks }, { apps }]) => {
    return [
      formatBackupSystem(hooks),
      fromEntries(apps.map((app) => [app.id, app])),
    ] as const
  })

const selected = ref([...Object.keys(system), ...Object.keys(apps)])

function toggleSelected(select: boolean, type: 'system' | 'apps') {
  const keys = Object.keys(type === 'system' ? system : apps)
  if (select) {
    const toSelect = keys.filter((item) => !selected.value.includes(item))
    selected.value = [...selected.value, ...toSelect]
  } else {
    selected.value = selected.value.filter(
      (selected) => !keys.includes(selected),
    )
  }
}

function createBackup() {
  const data = parseBackupForm(selected.value, system)
  api.post({ uri: 'backups', data, humanKey: 'backups.create' }).then(() => {
    router.push({ name: 'backup-list', params: { id: props.id } })
  })
}

const CheckboxList = createReusableTemplate<{
  icon: string
  type: 'system' | 'apps'
  data: typeof system | typeof apps
}>()
</script>

<template>
  <div>
    <CheckboxList.define v-slot="{ type, icon, data }">
      <!-- SYSTEM HEADER -->
      <BListGroupItem
        class="d-flex align-items-sm-center flex-column flex-sm-row text-primary"
      >
        <h4 class="m-0"><YIcon :iname="icon" /> {{ $t(type) }}</h4>

        <div class="ms-sm-auto mt-2 mt-sm-0">
          <BButton
            v-t="'select_all'"
            size="sm"
            variant="outline-dark"
            @click="toggleSelected(true, type)"
          />

          <BButton
            v-t="'select_none'"
            size="sm"
            variant="outline-dark"
            class="ms-2"
            @click="toggleSelected(false, type)"
          />
        </div>
      </BListGroupItem>

      <!-- SYSTEM ITEMS -->
      <BListGroupItem
        v-for="(item, partName) in data"
        :key="partName"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <!-- FIXME use FormField or BFormGroup to get labels? -->
        <div class="me-2">
          <h5 v-if="'id' in item">
            <span class="fw-bold me-1">{{ item.name }}</span>
            <small class="text-secondary">{{ item.id }}</small>
          </h5>
          <h5 v-else class="fw-bold">
            {{ item.name }}
          </h5>
          <p class="m-0 text-muted">
            {{ item.description }}
          </p>
        </div>

        <BFormCheckbox :value="partName" :aria-label="$t('check')" />
      </BListGroupItem>
    </CheckboxList.define>

    <!-- FIXME use DefineTemplate -->
    <YCard :title="$t('backup_create')" icon="archive" no-body>
      <BFormCheckboxGroup
        id="backup-select"
        v-model="selected"
        name="backup-select"
        size="lg"
      >
        <BListGroup flush>
          <CheckboxList.reuse icon="cube" type="system" :data="system" />
          <CheckboxList.reuse icon="cubes" type="apps" :data="apps" />
        </BListGroup>
      </BFormCheckboxGroup>

      <!-- SUBMIT -->
      <template #buttons>
        <BButton
          v-t="'backup_action'"
          variant="success"
          :disabled="selected.length === 0"
          @click="createBackup"
        />
      </template>
    </YCard>
  </div>
</template>
