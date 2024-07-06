<script setup lang="ts">
import { computed, ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'

const { loading } = useInitialQueries([['GET', 'apps?full']], {
  onQueriesResponse,
})
const search = ref('')
const apps = ref()

const filteredApps = computed(() => {
  if (!apps.value) return
  const search_ = search.value.toLowerCase()
  // Check if any value in apps (label, id, name, description) match the search query.
  const filtered = apps.value.filter((app) =>
    Object.values(app).some(
      (item) => item && item.toLowerCase().includes(search_),
    ),
  )
  return filtered.length ? filtered : null
})

function onQueriesResponse(data: any) {
  if (data.apps.length === 0) {
    apps.value = null
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
    v-model:search="search"
    :filtered-items="filteredApps"
    items-name="installed_apps"
    :items="apps"
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
