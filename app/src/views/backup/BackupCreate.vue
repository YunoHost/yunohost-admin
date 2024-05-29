<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'

const props = defineProps<{
  id: string
}>()

const { t } = useI18n()
const router = useRouter()

const queries = [
  ['GET', 'hooks/backup'],
  ['GET', 'apps?with_backup'],
]
const selected = ref<string[]>([])
const system = ref()
const apps = ref()

function formatHooks(hooks) {
  const data = {}
  hooks.forEach((hook) => {
    const groupId = hook.startsWith('conf_')
      ? 'adminjs_group_configuration'
      : hook
    if (groupId in data) {
      data[groupId].value.push(hook)
      data[groupId].description += ', ' + t('hook_' + hook)
    } else {
      data[groupId] = {
        name: t('hook_' + groupId),
        value: [hook],
        description: t(groupId === hook ? `hook_${hook}_desc` : 'hook_' + hook),
      }
    }
  })
  return data
}

function onQueriesResponse({ hooks }, { apps }) {
  system.value = formatHooks(hooks)
  // transform app array into literal object to match hooks data structure
  apps.value = apps.reduce((obj, app) => {
    obj[app.id] = app
    return obj
  }, {})
  selected.value = [...Object.keys(system.value), ...Object.keys(apps.value)]
}

function toggleSelected(select: boolean, type: 'system' | 'apps') {
  const keys = Object.keys((type === 'system' ? system : apps).value)
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
  const data = { apps: [], system: [] }
  for (const item of selected.value) {
    if (item in system.value) {
      data.system = [...data.system, ...system.value[item].value]
    } else {
      data.apps.push(item)
    }
  }

  api.post('backups', data, 'backups.create').then(() => {
    router.push({ name: 'backup-list', params: { id: props.id } })
  })
}
</script>

<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardListSkeleton"
  >
    <!-- FIXME switch to <CardForm> ? -->
    <YCard :title="$t('backup_create')" icon="archive" no-body>
      <BFormCheckboxGroup
        v-model="selected"
        id="backup-select"
        name="backup-select"
        size="lg"
      >
        <BListGroup flush>
          <!-- SYSTEM HEADER -->
          <BListGroupItem
            class="d-flex align-items-sm-center flex-column flex-sm-row text-primary"
          >
            <h4 class="m-0"><YIcon iname="cube" /> {{ $t('system') }}</h4>

            <div class="ms-sm-auto mt-2 mt-sm-0">
              <BButton
                @click="toggleSelected(true, 'system')"
                v-t="'select_all'"
                size="sm"
                variant="outline-dark"
              />

              <BButton
                @click="toggleSelected(false, 'system')"
                v-t="'select_none'"
                size="sm"
                variant="outline-dark"
                class="ms-2"
              />
            </div>
          </BListGroupItem>

          <!-- SYSTEM ITEMS -->
          <BListGroupItem
            v-for="(item, partName) in system"
            :key="partName"
            class="d-flex justify-content-between align-items-center pe-0"
          >
            <div class="me-2">
              <h5 class="fw-bold">
                {{ item.name }}
              </h5>
              <p class="m-0 text-muted">
                {{ item.description }}
              </p>
            </div>

            <BFormCheckbox
              :value="partName"
              :aria-label="$t('check')"
              class="d-inline"
            />
          </BListGroupItem>

          <!-- APPS HEADER -->
          <BListGroupItem
            class="d-flex align-items-sm-center flex-column flex-sm-row text-primary"
          >
            <h4 class="m-0">
              <YIcon iname="cubes" /> {{ $t('applications') }}
            </h4>

            <div class="ms-sm-auto mt-2 mt-sm-0">
              <BButton
                @click="toggleSelected(true, 'apps')"
                v-t="'select_all'"
                size="sm"
                variant="outline-dark"
              />

              <BButton
                @click="toggleSelected(false, 'apps')"
                v-t="'select_none'"
                size="sm"
                variant="outline-dark"
                class="ms-2"
              />
            </div>
          </BListGroupItem>

          <!-- APPS ITEMS -->
          <BListGroupItem
            v-for="(item, appName) in apps"
            :key="appName"
            class="d-flex justify-content-between align-items-center pe-0"
          >
            <div class="me-2">
              <h5 class="fw-bold">
                {{ item.name }}
                <small class="text-secondary">{{ item.id }}</small>
              </h5>
              <p class="m-0">
                {{ item.description }}
              </p>
            </div>

            <BFormCheckbox
              :value="appName"
              :aria-label="$t('check')"
              class="d-inline"
            />
          </BListGroupItem>
        </BListGroup>
      </BFormCheckboxGroup>

      <!-- SUBMIT -->
      <template #buttons>
        <BButton
          @click="createBackup"
          v-t="'backup_action'"
          variant="success"
          :disabled="selected.length === 0"
        />
      </template>
    </YCard>
  </ViewBase>
</template>
