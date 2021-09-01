<template>
  <b-breadcrumb v-if="routesList">
    <b-breadcrumb-item to="/">
      <span class="sr-only">{{ $t('home') }}</span>
      <icon iname="home" />
    </b-breadcrumb-item>

    <b-breadcrumb-item
      v-for="{ name, text } in breadcrumb" :key="name"
      :to="{ name }" :active="name === $route.name"
    >
      {{ text }}
    </b-breadcrumb-item>
  </b-breadcrumb>
</template>

<script>
export default {
  name: 'Breadcrumb',

  computed: {
    routesList () {
      const routesList = this.$route.meta.breadcrumb
      return routesList && routesList.length ? routesList : null
    },

    breadcrumb () {
      if (!this.routesList) return
      // Get current params to pass it to potential previous routes
      const currentParams = this.$route.params
      return this.routesList.map(name => {
        const { trad, param } = this.getRouteArgs(name)
        let text = ''
        // if a traduction key string has been given and we also need to pass
        // the route param as a variable.
        if (trad && param) {
          text = this.$i18n.t(trad, { [param]: currentParams[param] })
        } else if (trad) {
          text = this.$i18n.t(trad)
        } else {
          text = currentParams[param]
        }
        return { name, text }
      })
    }
  },

  methods: {
    getRouteArgs (routeName) {
      const route = this.$router.options.routes.find(route => route.name === routeName)
      switch (route.name) {
        case 'home':
          document.title = this.$i18n.t('home') + ' - YunoHost Admin'
          break
        case 'login':
          document.title = this.$i18n.t('login') + ' - YunoHost Admin'
          break
        case 'post-install':
          document.title = this.$i18n.t('postinstall_intro_1') + ' - YunoHost Admin'
          break
        case 'domain-list':
          document.title = this.$i18n.t('domains') + ' - YunoHost Admin'
          break
          case 'domain-add':
            document.title = this.$i18n.t('domain_add') + ' - YunoHost Admin'
            break
        case 'domain-info':
          document.title = this.$i18n.t('domain_info') + ' - YunoHost Admin'
          break
        case 'domain-dns':
          document.title = this.$i18n.t('domain_dns_config') + ' - YunoHost Admin'
          break
        case 'domain-cert':
          document.title = this.$i18n.t('ssl_certificate') + ' - YunoHost Admin'
          break
        case 'user-list':
          document.title = this.$i18n.t('users') + ' - YunoHost Admin'
          break
        case 'user-info':
          document.title = this.$i18n.t('user_info') + ' - YunoHost Admin'
          break
        case 'user-edit':
          document.title = this.$i18n.t('user_edit') + ' - YunoHost Admin'
          break
        case 'user-create':
          document.title = this.$i18n.t('users_new') + ' - YunoHost Admin'
          break
        case 'group-list':
          document.title = this.$i18n.t('groups_and_permissions') + ' - YunoHost Admin'
          break
        case 'group-create':
          document.title = this.$i18n.t('group_new') + ' - YunoHost Admin'
          break
        case 'app-list':
          document.title = this.$i18n.t('applications') + ' - YunoHost Admin'
          break
        case 'app-info':
          document.title = this.$i18n.t('operations') + ' - ' + this.$i18n.t('applications') + ' - YunoHost Admin'
          break
        case 'app-actions':
          document.title = this.$i18n.t('operations') + ' - ' + this.$i18n.t('applications') + ' - YunoHost Admin'
          break
        case 'app-config-panel':
          document.title = this.$i18n.t('app_config_panel') + ' - YunoHost Admin'
          break
        case 'app-catalog':
          document.title = this.$i18n.t('catalog') + ' - YunoHost Admin'
          break
        case 'app-install':
          document.title = this.$i18n.t('app_install_parameters') + ' - YunoHost Admin'
          break
        case 'app-install-custom':
          document.title = this.$i18n.t('app_install_parameters') + ' - YunoHost Admin'
          break
        case 'update':
          document.title = this.$i18n.t('system_upgrade_btn') + ' - YunoHost Admin'
          break
        case 'service-list':
          document.title = this.$i18n.t('services') + ' - YunoHost Admin'
          break
        case 'service-info':
          document.title = this.$i18n.t('logs_service') + ' - YunoHost Admin'
          break
        case 'tool-list':
          document.title = this.$i18n.t('tools') + ' - YunoHost Admin'
          break
        case 'tool-logs':
          document.title = this.$i18n.t('logs') + ' ' + this.$i18n.t('system').toLowerCase() + ' - YunoHost Admin'
          break
        case 'tool-log':
          document.title = this.$i18n.t('logs') + ' - YunoHost Admin'
          break
        case 'tool-migrations':
          document.title = this.$i18n.t('migrations') + ' - YunoHost Admin'
          break
        case 'tool-firewall':
          document.title = this.$i18n.t('firewall') + ' - YunoHost Admin'
          break
        case 'tool-adminpw':
          document.title = this.$i18n.t('tools_adminpw') + ' - YunoHost Admin'
          break
        case 'tool-webadmin':
          document.title = this.$i18n.t('tools_webadmin_settings') + ' - YunoHost Admin'
          break
        case 'tool-power':
          document.title = this.$i18n.t('tools_shutdown_btn') + ' / ' + this.$i18n.t('tools_reboot_btn') + ' - YunoHost Admin'
          break
        case 'diagnosis':
          document.title = this.$i18n.t('diagnosis') + ' - YunoHost Admin'
          break
        case 'backup':
          document.title = this.$i18n.t('backup') + ' - YunoHost Admin'
          break
        case 'backup-list':
          document.title = this.$i18n.t('backup') + ' - YunoHost Admin'
          break
        case 'backup-info':
          document.title = this.$i18n.t('backup_content') + ' - YunoHost Admin'
          break
        case 'backup-create':
          document.title = this.$i18n.t('backup_create') + ' - YunoHost Admin'
          break
        default:
          document.title = 'YunoHost Admin'
      }
      return route ? route.meta.args : {}
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent;
}
</style>
