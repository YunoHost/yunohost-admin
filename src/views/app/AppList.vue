<script setup lang="ts">
import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import type { AppList } from '@/types/core/api'

const apps = await api
  .get<AppList>({ uri: 'apps?full', initial: true })
  .then(({ apps }) => {
    const collator = new Intl.Collator('en')
    return apps
      .map(({ id, name, description, manifest, logo }) => {
        const logoUrl = logo
          ? `./applogos/${logo}.png`
          : 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
        return { id, name: manifest.name, label: name, description, logoUrl }
      })
      .sort((prev, app) => collator.compare(prev.label, app.label))
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
        {{ $t('install_app') }}
      </BButton>
    </template>

    <BListGroup>
      <YListItem
        v-for="{ id, description, label, logoUrl } in filteredApps"
        :key="id"
        :to="{ name: 'app-info', params: { id } }"
        :label="label"
        :sublabel="id"
        :description="description"
        :image-src="logoUrl"
      />
    </BListGroup>
  </ViewSearch>
</template>
