<script setup lang="ts">
import { ref, computed } from 'vue'

const queries = [['GET', 'apps?full']]
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

function onQueriesResponse({ apps }) {
  if (apps.length === 0) {
    apps.value = null
    return
  }

  apps.value = apps
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
    items-name="installed_apps"
    :items="apps"
    :filtered-items="filteredApps"
    :queries="queries"
    @queries-response="onQueriesResponse"
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
