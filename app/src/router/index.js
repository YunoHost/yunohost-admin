import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import store from '@/store'
import i18n from '@/i18n'

Vue.use(VueRouter)

const router = new VueRouter({
  // mode: 'history', // this allow all routes to be real ones (without '#')
  base: process.env.BASE_URL,
  routes,

  scrollBehavior (to, from, savedPosition) {
    // Mimics the native scroll behavior of the browser.
    // This allows the user to find his way back to the scroll level of the previous/next route.

    // if animations are enabled, we need to delay a bit the returned value of the saved
    // scroll state because the component probably hasn't updated the window height yet.
    // Note: this will only work with routes that use stored data or that has static content
    if (store.getters.transitions && savedPosition) {
      return new Promise(resolve => {
        setTimeout(() => resolve(savedPosition), 0)
      })
    } else {
      return savedPosition || { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  // Store routes translated titles
  var routesTitles = {
  home: i18n.t('home'),
  login: i18n.t('login'),
  'post-install': i18n.t('postinstall_intro_1'),
  'domain-list': i18n.t('domains'),
  'domain-add': i18n.t('domain_add'),
  'domain-info': i18n.t('domain_info'),
  'domain-dns': i18n.t('domain_dns_config'),
  'domain-cert': i18n.t('ssl_certificate'),
  'user-list': i18n.t('users'),
  'user-info': i18n.t('user_info'),
  'user-edit': i18n.t('user_edit'),
  'user-create': i18n.t('users_new'),
  'group-list': i18n.t('groups_and_permissions'),
  'group-create': i18n.t('group_new'),
  'app-list': i18n.t('applications'),
  'app-info': i18n.t('operations') + ' - ' + i18n.t('applications'),
  'app-actions': i18n.t('operations') + ' - ' + i18n.t('applications'),
  'app-config-panel': i18n.t('app_config_panel'),
  'app-catalog': i18n.t('catalog'),
  'app-install': i18n.t('app_install_parameters'),
  'app-install-custom': i18n.t('app_install_parameters'),
  update: i18n.t('system_upgrade_btn'),
  'service-list': i18n.t('services'),
  'service-info': i18n.t('logs_service'),
  'tool-list': i18n.t('tools'),
  'tool-log': i18n.t('logs') + ' ' + i18n.t('system').toLowerCase(),
  'tool-logs': i18n.t('logs'),
  'tool-migrations': i18n.t('migrations'),
  'tool-firewall': i18n.t('firewall'),
  'tool-adminpw': i18n.t('tools_adminpw'),
  'tool-webadmin': i18n.t('tools_webadmin_settings'),
  'tool-power': i18n.t('tools_shutdown_btn') + ' / ' + i18n.t('tools_reboot_btn'),
  diagnosis: i18n.t('diagnosis'),
  backup: i18n.t('backup'),
  'backup-list': i18n.t('backup'),
  'backup-info': i18n.t('backup_content'),
  'backup-create': i18n.t('backup_create')
  }

  document.title = (routesTitles[to.meta.title] !== to.meta.title) ? routesTitles[to.meta.title] + ' - YunoHost Admin' : 'YunoHost Admin'


  if (store.getters.error) {
    store.dispatch('DISMISS_ERROR', true)
  }
  // Allow if connected or route is not protected
  if (store.getters.connected || to.meta.noAuth) {
    next()
  } else {
    store.dispatch('DISCONNECT', to)
  }
})

export default router
