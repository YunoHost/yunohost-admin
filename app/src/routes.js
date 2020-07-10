import Home from './views/Home'
import Login from './views/Login'


const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login, meta: {noAuth: true}},
]

export default routes
