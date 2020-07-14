import Home from './views/Home'
import Login from './views/Login'
import Users from './views/Users'
import User from './views/User'


const routes = [
    {name: 'home', path: '/', component: Home},
    {name: 'login', path: '/login', component: Login, meta: {
        noAuth: true
    }},
    {name: 'users', path: '/users', component: Users, meta: {
        breadcrumb: [{name: 'users', trad: 'users'}]
    }},
    {name: 'user', path: '/user/:name', component: User, props: true, meta: {
        breadcrumb: [
            {name: 'users', trad: 'users'},
            {name: 'user', param: 'name'}
        ]
    }},
]

export default routes
