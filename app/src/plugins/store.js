import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        connected: localStorage.getItem('connected') === 'true'
    },
    mutations: {
        ['CONNECTED'] (state, connected) {
            localStorage.setItem('connected', connected)
            state.connected = connected
        },
    },
    actions: {
    },
    modules: {
    }
})
