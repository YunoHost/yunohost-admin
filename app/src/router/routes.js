import Home from '@/views/Home'
import Login from '@/views/Login'
import ToolList from '@/views/tool/ToolList'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    // Leave the empty breadcrumb as it is used by the animated transition to know which way to go
    meta: { breadcrumb: [] }
  },

  {
    name: 'login',
    path: '/login',
    component: Login,
    meta: { noAuth: true, breadcrumb: [] }
  },

  /* ───────────────╮
   │  POST INSTALL  │
   ╰─────────────── */
  {
    name: 'post-install',
    path: '/postinstall',
    component: () => import(/* webpackChunkName: "views/post-install" */ '@/views/PostInstall'),
    // Leave the breadcrumb
    meta: { noAuth: true }
  },

  /* ───────╮
   │  USER  │
   ╰─────── */
  {
    name: 'user-list',
    path: '/users',
    component: () => import(/* webpackChunkName: "views/user/list" */ '@/views/user/UserList'),
    meta: { breadcrumb: [{ name: 'user-list', trad: 'users' }] }
  },
  {
    name: 'user-create',
    path: '/users/create',
    component: () => import(/* webpackChunkName: "views/user/create" */ '@/views/user/UserCreate'),
    meta: {
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'user-create', trad: 'users_new' }
      ]
    }
  },
  {
    name: 'user-info',
    path: '/users/:name',
    component: () => import(/* webpackChunkName: "views/user/info" */ '@/views/user/UserInfo'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'user-info', param: 'name' }
      ]
    }
  },
  {
    name: 'user-edit',
    path: '/users/:name/edit',
    component: () => import(/* webpackChunkName: "views/user/edit" */ '@/views/user/UserEdit'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'user-info', param: 'name' },
        { name: 'user-edit', param: 'name', trad: 'user_username_edit' }
      ]
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
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'group-list', trad: 'groups_and_permissions' }
      ]
    }
  },
  {
    name: 'group-create',
    path: '/groups/create',
    component: () => import(/* webpackChunkName: "views/group/create" */ '@/views/group/GroupCreate'),
    meta: {
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'group-list', trad: 'groups_and_permissions' },
        { name: 'group-create', trad: 'group_new' }
      ]
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
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' }
      ]
    }
  },
  {
    name: 'domain-add',
    path: '/domains/add',
    component: () => import(/* webpackChunkName: "views/domain/add" */ '@/views/domain/DomainAdd'),
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' },
        { name: 'domain-add', trad: 'domain_add' }
      ]
    }
  },
  {
    name: 'domain-info',
    path: '/domains/:name',
    component: () => import(/* webpackChunkName: "views/domain/info" */ '@/views/domain/DomainInfo'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' },
        { name: 'domain-info', param: 'name' }
      ]
    }
  },
  {
    name: 'domain-dns',
    path: '/domains/:name/dns',
    component: () => import(/* webpackChunkName: "views/domain/dns" */ '@/views/domain/DomainDns'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' },
        { name: 'domain-info', param: 'name' },
        { name: 'domain-dns', trad: 'dns' }
      ]
    }
  },
  {
    name: 'domain-cert',
    path: '/domains/:name/cert-management',
    component: () => import(/* webpackChunkName: "views/domain/cert" */ '@/views/domain/DomainCert'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' },
        { name: 'domain-info', param: 'name' },
        { name: 'domain-cert', trad: 'certificate' }
      ]
    }
  },

  /* ───────╮
   │  APPS  │
   ╰─────── */
  {
    name: 'app-list',
    path: '/apps',
    component: () => import(/* webpackChunkName: "views/apps/list" */ '@/views/app/AppList'),
    meta: { breadcrumb: [{ name: 'app-list', trad: 'applications' }] }
  },
  {
    name: 'app-catalog',
    path: '/apps/catalog',
    component: () => import(/* webpackChunkName: "views/apps/catalog" */ '@/views/app/AppCatalog'),
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-catalog', trad: 'catalog' }
      ]
    }
  },
  {
    name: 'app-install',
    path: '/apps/install/:id',
    component: () => import(/* webpackChunkName: "views/apps/install" */ '@/views/app/AppInstall'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-catalog', trad: 'catalog' },
        { name: 'app-catalog', trad: 'install_name', param: 'id' }
      ]
    }
  },
  {
    name: 'app-install-custom',
    path: '/apps/install-custom/:id',
    component: () => import(/* webpackChunkName: "views/apps/install" */ '@/views/app/AppInstall'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-catalog', trad: 'catalog' },
        { name: 'app-catalog', trad: 'install_name', param: 'id' }
      ]
    }
  },
  {
    name: 'app-info',
    path: '/apps/:id',
    component: () => import(/* webpackChunkName: "views/apps/info" */ '@/views/app/AppInfo'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-info', param: 'id' }
      ]
    }
  },
  {
    name: 'app-actions',
    path: '/apps/:id/actions',
    component: () => import(/* webpackChunkName: "views/apps/actions" */ '@/views/app/AppActions'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-info', param: 'id' },
        { name: 'app-actions', trad: 'app_actions' }
      ]
    }
  },
  {
    name: 'app-config-panel',
    path: '/apps/:id/config-panel',
    component: () => import(/* webpackChunkName: "views/apps/config" */ '@/views/app/AppConfigPanel'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'app-list', trad: 'applications' },
        { name: 'app-info', param: 'id' },
        { name: 'app-config-panel', trad: 'app_config_panel' }
      ]
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
      breadcrumb: [
        { name: 'update', trad: 'system_update' }
      ]
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
      breadcrumb: [
        { name: 'service-list', trad: 'services' }
      ]
    }
  },
  {
    name: 'service-info',
    path: '/services/:name',
    component: () => import(/* webpackChunkName: "views/service/info" */ '@/views/service/ServiceInfo'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'service-list', trad: 'services' },
        { name: 'service-info', param: 'name' }
      ]
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
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' }
      ]
    }
  },
  {
    name: 'tool-logs',
    path: '/tools/logs',
    component: () => import(/* webpackChunkName: "views/tools/logs" */ '@/views/tool/ToolLogs'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-logs', trad: 'logs' }
      ]
    }
  },
  {
    name: 'tool-log',
    path: '/tools/logs/:name',
    component: () => import(/* webpackChunkName: "views/tools/log" */ '@/views/tool/ToolLog'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-logs', trad: 'logs' },
        { name: 'tool-log', param: 'name' }
      ]
    }
  },
  {
    name: 'tool-migrations',
    path: '/tools/migrations',
    component: () => import(/* webpackChunkName: "views/tools/migrations" */ '@/views/tool/ToolMigrations'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-migrations', trad: 'migrations' }
      ]
    }
  },
  {
    name: 'tool-firewall',
    path: '/tools/firewall',
    component: () => import(/* webpackChunkName: "views/tools/firewall" */ '@/views/tool/ToolFirewall'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-firewall', trad: 'firewall' }
      ]
    }
  },
  {
    name: 'tool-adminpw',
    path: '/tools/adminpw',
    component: () => import(/* webpackChunkName: "views/tools/adminpw" */ '@/views/tool/ToolAdminpw'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-adminpw', trad: 'tools_adminpw' }
      ]
    }
  },
  {
    name: 'tool-webadmin',
    path: '/tools/webadmin',
    component: () => import(/* webpackChunkName: "views/tools/webadmin" */ '@/views/tool/ToolWebadmin'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-webadmin', trad: 'tools_webadmin_settings' }
      ]
    }
  },
  {
    name: 'tool-power',
    path: '/tools/power',
    component: () => import(/* webpackChunkName: "views/tools/power" */ '@/views/tool/ToolPower'),
    meta: {
      breadcrumb: [
        { name: 'tool-list', trad: 'tools' },
        { name: 'tool-power', trad: 'tools_shutdown_reboot' }
      ]
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
      breadcrumb: [
        { name: 'diagnosis', trad: 'diagnosis' }
      ]
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
      breadcrumb: [
        { name: 'backup', trad: 'backup' }
      ]
    }
  },
  {
    name: 'backup-list',
    path: '/backup/:id',
    component: () => import(/* webpackChunkName: "views/backup/list" */ '@/views/backup/BackupList'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'backup', trad: 'backup' },
        { name: 'backup-list', param: 'id' }
      ]
    }
  },
  {
    name: 'backup-info',
    path: '/backup/:id/info/:name',
    component: () => import(/* webpackChunkName: "views/backup/info" */ '@/views/backup/BackupInfo'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'backup', trad: 'backup' },
        { name: 'backup-list', param: 'id' },
        { name: 'backup-info', param: 'name' }
      ]
    }
  },
  {
    name: 'backup-create',
    path: '/backup/:id/create',
    component: () => import(/* webpackChunkName: "views/backup/create" */ '@/views/backup/BackupCreate'),
    props: true,
    meta: {
      breadcrumb: [
        { name: 'backup', trad: 'backup' },
        { name: 'backup-list', param: 'id' },
        { name: 'backup-create', trad: 'backup_create' }
      ]
    }
  }
]

export default routes
