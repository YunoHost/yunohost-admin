import Home from '@/views/Home'
import Login from '@/views/Login'
import ToolList from '@/views/tool/ToolList'
import { UserList, UserCreate, UserInfo, UserEdit } from '@/views/user'
import { GroupList, GroupCreate } from '@/views/group'
import { DomainList, DomainAdd, DomainInfo, DomainDns, DomainCert } from '@/views/domain'
import { ServiceList, ServiceInfo } from '@/views/service'

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'login', path: '/login', component: Login, meta: { noAuth: true } },

  /* ───────────────╮
   │  POST INSTALL  │
   ╰─────────────── */
  {
    name: 'post-install',
    path: '/postinstall',
    component: () => import(/* webpackChunkName: "views/postinstall" */ '@/views/PostInstall'),
    meta: { noAuth: true }
  },

  /* ───────╮
   │  USER  │
   ╰─────── */
  {
    name: 'user-list',
    path: '/users',
    component: UserList,
    meta: { breadcrumb: [{ name: 'user-list', trad: 'users' }] }
  },
  {
    name: 'user-create',
    path: '/users/create',
    component: UserCreate,
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
    component: UserInfo,
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
    component: UserEdit,
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
    component: GroupList,
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
    component: GroupCreate,
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
    component: DomainList,
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' }
      ]
    }
  },
  {
    name: 'domain-add',
    path: '/domains/add',
    component: DomainAdd,
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
    component: DomainInfo,
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
    component: DomainDns,
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
    component: DomainCert,
    props: true,
    meta: {
      breadcrumb: [
        { name: 'domain-list', trad: 'domains' },
        { name: 'domain-info', param: 'name' },
        { name: 'domain-cert', trad: 'certificate' }
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
    component: ServiceList,
    meta: {
      breadcrumb: [
        { name: 'service-list', trad: 'services' }
      ]
    }
  },
  {
    name: 'service-info',
    path: '/services/:name',
    component: ServiceInfo,
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolLogs'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolLog'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolMigrations'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolFirewall'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolAdminpw'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolWebadmin'),
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
    component: () => import(/* webpackChunkName: "views/tools" */ '@/views/tool/ToolPower'),
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
    component: () => import(/* webpackChunkName: "views/backup" */ '@/views/backup/Backup'),
    meta: {
      breadcrumb: [
        { name: 'backup', trad: 'backup' }
      ]
    }
  },
  {
    name: 'backup-list',
    path: '/backup/:id',
    component: () => import(/* webpackChunkName: "views/backup" */ '@/views/backup/BackupList'),
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
    component: () => import(/* webpackChunkName: "views/backup" */ '@/views/backup/BackupInfo'),
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
    component: () => import(/* webpackChunkName: "views/backup" */ '@/views/backup/BackupCreate'),
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
