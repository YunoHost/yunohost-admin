<!-- FIXME make a component shared with Home.vue ? -->
<template>
  <b-list-group class="menu-list">
    <b-list-group-item
      v-for="item in menu"
      :key="item.routeName"
      :to="{name: item.routeName}"
    >
      <icon :iname="item.icon" class="lg ml-1" />
      <h4>{{ $t(item.translation) }}</h4>
      <icon iname="chevron-right" class="lg fs-sm ml-auto" />
    </b-list-group-item>
  </b-list-group>
</template>

<script>
export default {
  name: 'ToolList',

  data () {
    return {
      menu: [
        { routeName: 'tool-logs', icon: 'book', translation: 'logs' },
        { routeName: 'tool-migrations', icon: 'share', translation: 'migrations' },
        { routeName: 'service-list', icon: 'gears', translation: 'services' },
        { routeName: 'tool-firewall', icon: 'shield', translation: 'firewall' },
        { routeName: 'tool-settings', icon: 'sliders', translation: 'tools_yunohost_settings' },
        { routeName: 'tool-webadmin', icon: 'sliders', translation: 'tools_webadmin_settings' },
        { routeName: 'tool-power', icon: 'power-off', translation: 'tools_shutdown_reboot' }
      ]
    }
  }
}
</script>
