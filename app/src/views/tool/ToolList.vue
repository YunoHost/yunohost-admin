<script setup lang="ts">
const menu = [
  { routeName: 'tool-logs', icon: 'book', translation: 'logs' },
  {
    routeName: 'tool-migrations',
    icon: 'share',
    translation: 'migrations',
  },
  { routeName: 'service-list', icon: 'gears', translation: 'services' },
  { routeName: 'tool-firewall', icon: 'shield', translation: 'firewall' },
  {
    routeName: 'tool-settings',
    icon: 'sliders',
    translation: 'tools_yunohost_settings',
  },
  {
    routeName: 'tool-webadmin',
    icon: 'sliders',
    translation: 'tools_webadmin_settings',
  },
  {
    routeName: 'tool-power',
    icon: 'power-off',
    translation: 'tools_shutdown_reboot',
  },
]
</script>

<!-- FIXME make a component shared with HomeView.vue ? -->
<template>
  <BListGroup class="menu-list">
    <BListGroupItem
      v-for="item in menu"
      :key="item.routeName"
      :to="{ name: item.routeName }"
    >
      <YIcon :iname="item.icon" class="lg ms-1" />
      <h4>{{ $t(item.translation) }}</h4>
      <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
    </BListGroupItem>
  </BListGroup>
</template>
