/**
 * routes module.
 * @module router/routes
 */

// Simple views are normally imported and will be included into the main webpack entry.
// Others will be chunked by webpack so they can be lazy loaded.
// Webpack chunk syntax is:
// `() => import(/* webpackChunkName: "views/:nameOfWantedFile" */ '@/views/:ViewComponent')`

import Home from '@/views/Home'
import Login from '@/views/Login'
import ToolList from '@/views/tool/ToolList'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    // Leave the empty breadcrumb as it is used by the animated transition to know which way to go
    meta: { title: 'home', breadcrumb: [] }
  },

  {
    name: 'login',
    path: '/login',
    component: Login,
    meta: { title: 'login', noAuth: true, breadcrumb: [] }
  },

  /* ───────────────╮
   │  POST INSTALL  │
   ╰─────────────── */
  {
    name: 'post-install',
    path: '/postinstall',
    component: () => import(/* webpackChunkName: "views/post-install" */ '@/views/PostInstall'),
    // Leave the breadcrumb
    meta: { title: 'post-install', noAuth: true, breadcrumb: [] }
  },

  /* ───────╮
   │  USER  │
   ╰─────── */
  {
    name: 'user-list',
    path: '/users',
    component: () => import(/* webpackChunkName: "views/user/list" */ '@/views/user/UserList'),
    meta: {
      title: 'user-list',
      args: { trad: 'users' },
      breadcrumb: ['user-list']
    }
  },
  {
    name: 'user-create',
    path: '/users/create',
    component: () => import(/* webpackChunkName: "views/user/create" */ '@/views/user/UserCreate'),
    meta: {
      title: 'user-create',
      args: { trad: 'users_new' },
      breadcrumb: ['user-list', 'user-create']
    }
  },
  {
    name: 'user-info',
    path: '/users/:name',
    component: () => import(/* webpackChunkName: "views/user/info" */ '@/views/user/UserInfo'),
    props: true,
    meta: {
      title: 'user-info',
      args: { param: 'name' },
      breadcrumb: ['user-list', 'user-info']
    }
  },
  {
    name: 'user-edit',
    path: '/users/:name/edit',
    component: () => import(/* webpackChunkName: "views/user/edit" */ '@/views/user/UserEdit'),
    props: true,
    meta: {
      title: 'user-edit',
      args: { param: 'name', trad: 'user_username_edit' },
      breadcrumb: ['user-list', 'user-info', 'user-edit']
    }
  },

  /* ────────╮
   │  GROUP  │
   ╰──────── */
  {
    name: 'group-list',
    path: '/groups',
    component: () => import(/* webpackChunkName: "views/group/list" */ '@/views/group/GroupList'),
    meta: {
      title: 'group-list',
      args: { trad: 'groups_and_permissions' },
      breadcrumb: ['user-list', 'group-list']
    }
  },
  {
    name: 'group-create',
    path: '/groups/create',
    component: () => import(/* webpackChunkName: "views/group/create" */ '@/views/group/GroupCreate'),
    meta: {
      title: 'group-create',
      args: { trad: 'group_new' },
      breadcrumb: ['user-list', 'group-list', 'group-create']
    }
  },

  /* ─────────╮
   │  DOMAIN  │
   ╰───────── */
  {
    name: 'domain-list',
    path: '/domains',
    component: () => import(/* webpackChunkName: "views/domain/list" */ '@/views/domain/DomainList'),
    meta: {
      title: 'domain-list',
      args: { trad: 'domains' },
      breadcrumb: ['domain-list']
    }
  },
  {
    name: 'domain-add',
    path: '/domains/add',
    component: () => import(/* webpackChunkName: "views/domain/add" */ '@/views/domain/DomainAdd'),
    meta: {
      title: 'domain-add',
      args: { trad: 'domain_add' },
      breadcrumb: ['domain-list', 'domain-add']
    }
  },
  {
    name: 'domain-info',
    path: '/domains/:name',
    component: () => import(/* webpackChunkName: "views/domain/info" */ '@/views/domain/DomainInfo'),
    props: true,
    meta: {
      title: 'domain-info',
      args: { param: 'name' },
      breadcrumb: ['domain-list', 'domain-info']
    }
  },
  {
    name: 'domain-dns',
    path: '/domains/:name/dns',
    component: () => import(/* webpackChunkName: "views/domain/dns" */ '@/views/domain/DomainDns'),
    props: true,
    meta: {
      title: 'domain-dns',
      args: { trad: 'dns' },
      breadcrumb: ['domain-list', 'domain-info', 'domain-dns']
    }
  },
  {
    name: 'domain-cert',
    path: '/domains/:name/cert-management',
    component: () => import(/* webpackChunkName: "views/domain/cert" */ '@/views/domain/DomainCert'),
    props: true,
    meta: {
      title: 'domain-cert',
      args: { trad: 'certificate' },
      breadcrumb: ['domain-list', 'domain-info', 'domain-cert']
    }
  },

  /* ───────╮
   │  APPS  │
   ╰─────── */
  {
    name: 'app-list',
    path: '/apps',
    component: () => import(/* webpackChunkName: "views/apps/list" */ '@/views/app/AppList'),
    meta: {
      title: 'app-list',
      args: { trad: 'applications' },
      breadcrumb: ['app-list']
    }
  },
  {
    name: 'app-catalog',
    path: '/apps/catalog',
    component: () => import(/* webpackChunkName: "views/apps/catalog" */ '@/views/app/AppCatalog'),
    meta: {
      title: 'app-catalog',
      args: { trad: 'catalog' },
      breadcrumb: ['app-list', 'app-catalog']
    }
  },
  {
    name: 'app-install',
    path: '/apps/install/:id',
    component: () => import(/* webpackChunkName: "views/apps/install" */ '@/views/app/AppInstall'),
    props: true,
    meta: {
      title: 'app-install',
      args: { trad: 'install_name', param: 'id' },
      breadcrumb: ['app-list', 'app-catalog', 'app-install']
    }
  },
  {
    name: 'app-install-custom',
    path: '/apps/install-custom/:id',
    component: () => import(/* webpackChunkName: "views/apps/install" */ '@/views/app/AppInstall'),
    props: true,
    meta: {
      title: 'app-install-custom',
      args: { trad: 'install_name', param: 'id' },
      breadcrumb: ['app-list', 'app-catalog', 'app-install-custom']
    }
  },
  {
    name: 'app-info',
    path: '/apps/:id',
    component: () => import(/* webpackChunkName: "views/apps/info" */ '@/views/app/AppInfo'),
    props: true,
    meta: {
      title: 'app-info',
      args: { param: 'id' },
      breadcrumb: ['app-list', 'app-info']
    }
  },
  {
    name: 'app-actions',
    path: '/apps/:id/actions',
    component: () => import(/* webpackChunkName: "views/apps/actions" */ '@/views/app/AppActions'),
    props: true,
    meta: {
      title: 'app-actions',
      args: { trad: 'app_actions' },
      breadcrumb: ['app-list', 'app-info', 'app-actions']
    }
  },
  {
    name: 'app-config-panel',
    path: '/apps/:id/config-panel',
    component: () => import(/* webpackChunkName: "views/apps/config" */ '@/views/app/AppConfigPanel'),
    props: true,
    meta: {
      title: 'app-config-panel',
      args: { trad: 'app_config_panel' },
      breadcrumb: ['app-list', 'app-info', 'app-config-panel']
    }
  },

  /* ────────────────╮
   │  SYSTEM UPDATE  │
   ╰──────────────── */
  {
    name: 'update',
    path: '/update',
    component: () => import(/* webpackChunkName: "views/update" */ '@/views/update/SystemUpdate'),
    meta: {
      title: 'update',
      args: { trad: 'system_update' },
      breadcrumb: ['update']
    }
  },

  /* ──────────╮
   │  SERVICE  │
   ╰────────── */
  {
    name: 'service-list',
    path: '/services',
    component: () => import(/* webpackChunkName: "views/service/list" */ '@/views/service/ServiceList'),
    meta: {
      title: 'service-list',
      args: { trad: 'services' },
      breadcrumb: ['service-list']
    }
  },
  {
    name: 'service-info',
    path: '/services/:name',
    component: () => import(/* webpackChunkName: "views/service/info" */ '@/views/service/ServiceInfo'),
    props: true,
    meta: {
      title: 'service-info',
      args: { param: 'name' },
      breadcrumb: ['service-list', 'service-info']
    }
  },

  /* ────────╮
   │  TOOLS  │
   ╰──────── */
  {
    name: 'tool-list',
    path: '/tools',
    component: ToolList,
    meta: {
      title: 'tool-list',
      args: { trad: 'tools' },
      breadcrumb: ['tool-list']
    }
  },
  {
    name: 'tool-logs',
    path: '/tools/logs',
    component: () => import(/* webpackChunkName: "views/tools/logs" */ '@/views/tool/ToolLogs'),
    meta: {
      title: 'tool-logs',
      args: { trad: 'logs' },
      breadcrumb: ['tool-list', 'tool-logs']
    }
  },
  {
    name: 'tool-log',
    path: '/tools/logs/:name',
    component: () => import(/* webpackChunkName: "views/tools/log" */ '@/views/tool/ToolLog'),
    props: true,
    meta: {
      title: 'tool-log',
      args: { param: 'name' },
      breadcrumb: ['tool-list', 'tool-logs', 'tool-log']
    }
  },
  {
    name: 'tool-migrations',
    path: '/tools/migrations',
    component: () => import(/* webpackChunkName: "views/tools/migrations" */ '@/views/tool/ToolMigrations'),
    meta: {
      title: 'tool-migrations',
      args: { trad: 'migrations' },
      breadcrumb: ['tool-list', 'tool-migrations']
    }
  },
  {
    name: 'tool-firewall',
    path: '/tools/firewall',
    component: () => import(/* webpackChunkName: "views/tools/firewall" */ '@/views/tool/ToolFirewall'),
    meta: {
      title: 'tool-firewall',
      args: { trad: 'firewall' },
      breadcrumb: ['tool-list', 'tool-firewall']
    }
  },
  {
    name: 'tool-adminpw',
    path: '/tools/adminpw',
    component: () => import(/* webpackChunkName: "views/tools/adminpw" */ '@/views/tool/ToolAdminpw'),
    meta: {
      title: 'tool-adminpw',
      args: { trad: 'tools_adminpw' },
      breadcrumb: ['tool-list', 'tool-adminpw']
    }
  },
  {
    name: 'tool-webadmin',
    path: '/tools/webadmin',
    component: () => import(/* webpackChunkName: "views/tools/webadmin" */ '@/views/tool/ToolWebadmin'),
    meta: {
      title: 'tool-webadmin',
      args: { trad: 'tools_webadmin_settings' },
      breadcrumb: ['tool-list', 'tool-webadmin']
    }
  },
  {
    name: 'tool-power',
    path: '/tools/power',
    component: () => import(/* webpackChunkName: "views/tools/power" */ '@/views/tool/ToolPower'),
    meta: {
      title: 'tool-power',
      args: { trad: 'tools_shutdown_reboot' },
      breadcrumb: ['tool-list', 'tool-power']
    }
  },

  /* ────────────╮
   │  DIAGNOSIS  │
   ╰──────────── */
  {
    name: 'diagnosis',
    path: '/diagnosis',
    component: () => import(/* webpackChunkName: "views/diagnosis" */ '@/views/diagnosis/Diagnosis'),
    meta: {
      title: 'diagnosis',
      args: { trad: 'diagnosis' },
      breadcrumb: ['diagnosis']
    }
  },

  /* ─────────╮
   │  BACKUP  │
   ╰───────── */
  {
    name: 'backup',
    path: '/backup',
    component: () => import(/* webpackChunkName: "views/backup/backup" */ '@/views/backup/Backup'),
    meta: {
      title: 'backup',
      args: { trad: 'backup' },
      breadcrumb: ['backup']
    }
  },
  {
    name: 'backup-list',
    path: '/backup/:id',
    component: () => import(/* webpackChunkName: "views/backup/list" */ '@/views/backup/BackupList'),
    props: true,
    meta: {
      title: 'backup-list',
      args: { param: 'id' },
      breadcrumb: ['backup', 'backup-list']
    }
  },
  {
    name: 'backup-info',
    path: '/backup/:id/info/:name',
    component: () => import(/* webpackChunkName: "views/backup/info" */ '@/views/backup/BackupInfo'),
    props: true,
    meta: {
      title: 'backup-info',
      args: { param: 'name' },
      breadcrumb: ['backup', 'backup-list', 'backup-info']
    }
  },
  {
    name: 'backup-create',
    path: '/backup/:id/create',
    component: () => import(/* webpackChunkName: "views/backup/create" */ '@/views/backup/BackupCreate'),
    props: true,
    meta: {
      title: 'backup-create',
      args: { trad: 'backup_create' },
      breadcrumb: ['backup', 'backup-list', 'backup-create']
    }
  }
]

export default routes
