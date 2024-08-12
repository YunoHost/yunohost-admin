<script setup lang="ts">
import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import type { AppList } from '@/types/core/api'

const apps = await api
  .get<AppList>({ uri: 'apps?full', initial: true })
  .then(({ apps }) => {
    return apps
      .map(({ id, name, description, manifest }) => {
        return { id, name: manifest.name, label: name, description }
      })
      .sort((prev, app) => {
        return prev.label > app.label ? 1 : -1
      })
  })

const [search, filteredApps] = useSearch(apps, (s, app) =>
  Object.values(app).some((value) => value && value.toLowerCase().includes(s)),
)
</script>

<template>
  <ViewSearch
    v-model="search"
    items-name="installed_apps"
    :items="filteredApps"
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
          <h5>
            <strong class="me-1 fw-bold">{{ label }}</strong>
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
