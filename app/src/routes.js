import Home from './views/Home'
import Login from './views/Login'
import { UserList, UserCreate, UserInfo, UserEdit } from './views/user'
import { GroupList, GroupCreate } from './views/group'
import { DomainList, DomainAdd, DomainInfo, DomainDns, DomainCert } from './views/domain'

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'login', path: '/login', component: Login, meta: { noAuth: true } },

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
  }
]

export default routes
