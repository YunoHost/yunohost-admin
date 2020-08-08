<!-- FIXME make a component shared with Home.vue ? -->
<template>
  <div class="tools-menu">
    <b-list-group>
      <b-list-group-item
        v-for="item in menu"
        :key="item.id"
        :to="{name: item.routeName}"
      >
        <icon :iname="item.icon" class="lg" />
        <h2>{{ $t(item.translation) }}</h2>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'ToolList',

  data: () => {
    return {
      menu: [
        { id: 0, routeName: 'tool-logs', icon: 'book', translation: 'logs' },
        { id: 1, routeName: 'tool-migrations', icon: 'share', translation: 'migrations' },
        { id: 2, routeName: 'tool-firewall', icon: 'shield', translation: 'firewall' },
        { id: 3, routeName: 'tool-adminpw', icon: 'key-modern', translation: 'tools_adminpw' },
        { id: 3, routeName: 'tool-wabadmin', icon: 'cog', translation: 'tools_webadmin_settings' },
        { id: 4, routeName: 'tool-power', icon: 'power-off', translation: 'tools_shutdown_reboot' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.list-group-item {
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
}

h2 {
    font-size: 1.25rem;
    font-weight: 400;
    margin: 0;
}
</style>
