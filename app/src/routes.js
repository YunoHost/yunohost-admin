import Home from './views/Home'
import Login from './views/Login'


const routes = [
    {name: 'home', path: '/', component: Home},
    {name: 'login', path: '/login', component: Login, meta: {
        noAuth: true
    }},
]

export default routes
