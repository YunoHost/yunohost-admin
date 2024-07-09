<script setup lang="ts">
import { ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { useSearch } from '@/composables/useSearch'
import type { Obj } from '@/types/commons'

const { loading } = useInitialQueries([['GET', 'apps?full']], {
  onQueriesResponse,
})

const apps = ref<Obj[] | undefined>()
const [search, filteredApps] = useSearch(apps, (s, app) => {
  return Object.values(app).some(
    (value) => value && value.toLowerCase().includes(s),
  )
})

function onQueriesResponse(data: any) {
  if (data.apps.length === 0) {
    apps.value = undefined
    return
  }

  apps.value = data.apps
    .map(({ id, name, description, manifest }) => {
      return { id, name: manifest.name, label: name, description }
    })
    .sort((prev, app) => {
      return prev.label > app.label ? 1 : -1
    })
}
</script>

<template>
  <ViewSearch
    v-model="search"
    items-name="installed_apps"
    :items="filteredApps"
    :loading="loading"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'app-catalog' }">
        <YIcon iname="plus" />
        {{ $t('install') }}
      </BButton>
    </template>

    <BListGroup>
      <BListGroupItem
        v-for="{ id, description, label } in filteredApps"
        :key="id"
        :to="{ name: 'app-info', params: { id } }"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <div>
          <h5 class="fw-bold">
            {{ label }}
            <small class="text-secondary">{{ id }}</small>
          </h5>
          <p class="m-0">
            {{ description }}
          </p>
        </div>

        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </ViewSearch>
</template>
