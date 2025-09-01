<script setup lang="ts">
import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import type { AppList } from '@/types/core/api'

const apps = await api
  .get<AppList>({ uri: 'apps?full', initial: true })
  .then(({ apps }) => {
    return apps
      .map(({ id, name, description, manifest, logo, upgrade, from_catalog}) => {
        const logoUrl = logo
          ? `./applogos/${logo}.png`
          : 'data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
        let badges: BadgesInfos = Array();
        let notifications_count = Object.keys(manifest.notifications.POST_INSTALL || {}).length + Object.keys(manifest.notifications.POST_UPGRADE || {}).length
        if (notifications_count > 0)
        {
           badges.push({text: notifications_count + ' notifications', variant: "info", icon: 'info-circle'})
        }
        if (upgrade.status == "upgradable")
        {
           badges.push({text: 'Upgrade available', variant: "info", icon: 'arrow-up'})
        }
        else if (upgrade.status == "url_required")
        {
           badges.push({text: 'Not in catalog', variant: "danger", icon: 'chain-broken'})
        }
        if ((id == 'helloworld__2') || (from_catalog && from_catalog.antifeatures && Array(from_catalog.antifeatures).includes("deprecated-software")))
        {
           badges.push({text: 'Deprecated', variant: "warning", icon: 'exclamation-triangle'})
        }
        return { id, label: name, description, logoUrl, badges }
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
        {{ $t('install_app') }}
      </BButton>
    </template>

    <BListGroup>
      <YListItem
        v-for="{ id, description, label, logoUrl, badges } in filteredApps"
        :key="id"
        :to="{ name: 'app-info', params: { id } }"
        :label="label"
        :sublabel="id"
        :description="description"
        :image-src="logoUrl"
        :badges="badges"
      />
    </BListGroup>
  </ViewSearch>
</template>
