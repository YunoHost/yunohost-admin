import Home from './views/Home'
import Login from './views/Login'
import { UserList, UserCreate, User } from './views/user'

const routes = [
  { name: 'home', path: '/', component: Home },
  { name: 'login', path: '/login', component: Login, meta: { noAuth: true } },

  // Users routes
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
    component: User,
    props: true,
    meta: {
      breadcrumb: [
        { name: 'user-list', trad: 'users' },
        { name: 'user-info', param: 'name' }
      ]
    }
  }
]

export default routes
