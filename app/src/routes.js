import Home from './views/Home'
import Login from './views/Login'
import Users from './views/Users'


const routes = [
    {name: 'home', path: '/', component: Home},
    {name: 'login', path: '/login', component: Login, meta: {
        noAuth: true
    }},
    {name: 'users', path: '/users', component: Users, meta: {
        breadcrumb: [{name: 'users', trad: 'users'}]
    }},
]

export default routes
