<script setup lang="ts">
import api from '@/api'
const menu = [
  { routeName: 'user-list', icon: 'users', translation: 'users' },
  {
    routeName: 'group-list',
    icon: 'key-modern',
    translation: 'groups_and_permissions',
  },
  { routeName: 'domain-list', icon: 'globe', translation: 'domains' },
  { routeName: 'app-list', icon: 'cubes', translation: 'applications' },
  { routeName: 'update', icon: 'refresh', translation: 'system_update' },
  { routeName: 'tool-list', icon: 'wrench', translation: 'tools' },
  {
    routeName: 'diagnosis',
    icon: 'stethoscope',
    translation: 'diagnosis',
  },
  { routeName: 'backup', icon: 'archive', translation: 'backup' },
]

const { apps_badges, upgrades_badges, diagnosis_badges } = await api
  .get({ uri: 'dash', initial: true})
  .then(({ apps, upgrades, diagnosis }) => {

    let apps_badges: BadgeInfos[] = Array();
    if (apps.notifications > 0) {
        apps_badges.push({text: apps.notifications + ' notifications', variant: "info", icon: 'info-circle'})
    }

    let upgrades_badges: BadgeInfos[] = Array();
    if (upgrades.pending_migrations > 0)
    {
        upgrades_badges.push({text: upgrades.pending_migrations + ' pending migrations', variant: "info", icon: "forward" })
    }
    if (upgrades.system_packages > 0)
    {
        upgrades_badges.push({text: upgrades.system_packages + ' system upgrades', variant: "info", icon: "server" })
    }
    if (upgrades.pending_migrations > 0)
    {
        upgrades_badges.push({text: upgrades.apps + ' app upgrades', variant: "info", icon: "cubes" })
    }

    let diagnosis_badges: BadgeInfos[] = Array();
    if (diagnosis.warnings > 0)
    {
        diagnosis_badges.push({text: diagnosis.warnings + ' warnings', variant: "warning", icon: "exclamation-triangle" })
    }
    if (diagnosis.errors > 0)
    {
        diagnosis_badges.push({text: diagnosis.errors + ' issues', variant: "danger", icon: "times" })
    }

    return {apps_badges, upgrades_badges, diagnosis_badges}
  })

</script>

<template>
  <div class="home">
    <BListGroup class="menu-list">
      <BListGroupItem
        v-for="item in menu"
        :key="item.routeName"
        :to="{ name: item.routeName }"
      >
        <YIcon :iname="item.icon" class="lg ms-1" />
        <h4>{{ $t(item.translation) }}</h4>
        <YBadgeList v-if="item.routeName == 'app-list'" :badges="apps_badges" />
        <YBadgeList v-if="item.routeName == 'update'" :badges="upgrades_badges" />
        <YBadgeList v-if="item.routeName == 'diagnosis'" :badges="diagnosis_badges" />

        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>
