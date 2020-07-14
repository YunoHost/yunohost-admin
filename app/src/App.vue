<template>
    <div id="app">
        <header>
            <b-navbar>
                <b-navbar-brand to="/" exact exact-active-class="active"><img alt="Yunohost logo" src="./assets/logo.png"></b-navbar-brand>
                <b-navbar-nav class="ml-auto">
                    <li class="nav-item">
                        <b-button href="/yunohost/sso" variant="primary" block size="sm">
                            {{ $t('user_interface_link') }} <icon iname="user"/>
                        </b-button>
                    </li>
                    <li class="nav-item" v-show="connected">
                        <b-button @click.prevent="logout" to="/logout" variant="outline-dark" block size="sm" >
                            {{ $t('logout') }} <icon iname="sign-out"/>
                        </b-button>
                    </li>
                </b-navbar-nav>
            </b-navbar>
        </header>

        <main>
            <router-view v-if="isReady"/>
        </main>

        <footer>
            <nav>
                <b-nav>
                    <b-nav-item href="https://yunohost.org/docs" target="_blank" link-classes='text-secondary'>
                        <icon iname="book"/> Documentation
                    </b-nav-item>
                    <b-nav-item href="https://yunohost.org/help" target="_blank" link-classes='text-secondary'>
                        <icon iname="life-ring"/> Need help?
                    </b-nav-item>
                    <b-nav-item href="https://donate.yunohost.org/" target="_blank" link-classes='text-secondary'>
                        <icon iname="heart"/> Donate
                    </b-nav-item>
                    <i18n v-if="yunohostInfos" path="footer_version" tag="b-nav-text" class="ml-auto" id="yunohost-version">
                        <template v-slot:ynh><b-link href="https://yunohost.org">YunoHost</b-link></template>
                        <template v-slot:version>{{ yunohostInfos.version }}</template>
                        <template v-slot:repo>{{ yunohostInfos.repo }}</template>
                    </i18n>
                </b-nav>
            </nav>
        </footer>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import api from '@/helpers/api'


export default {
    name: 'App',
    data: () => {
        return {
            // isReady blocks the rendering of the rooter-view until we have a true info
            // about the connected state of the user.
            isReady: false,
        }
    },
    computed: {
        ...mapState(['connected', 'yunohostInfos']),
    },
    methods: {
        async logout() {
            await api.logout()
            this.$store.commit('CONNECTED', false);
            this.$router.push('/login')
        },
    },
    // This hook is only triggered at page reload so the value of state.connected
    // always come from the localStorage
    async created() {
        if (!this.$store.state.connected) {
            // user is not connected: allow the login view to be rendered.
            this.isReady = true
            return
        }
        // localStorage 'connected' value may be true, but session may have expired.
        // Try to get the yunohost version.
        try {
            const data = await api.getVersion()
            this.$store.commit('YUNOHOST_INFOS', data.yunohost)
        } catch (err) {
            // Session expired, reset the 'connected' state and redirect with a query
            // FIXME is there a case where the error may not be a 401 therefor requires
            // better handling ?
            this.$store.commit('CONNECTED', false);
            this.$router.push({name: 'login', query: {redirect: this.$route.path}})
        } finally {
            // in any case allow the router-view to be rendered
            this.isReady = true;
        }
    }
}
</script>

<style lang="scss">
@import '@/scss/main.scss';

header {
    border-bottom: 1px solid #eee;
    margin-top: 1rem;
    margin-bottom: 1rem;

    .navbar {
        padding: 1rem 0;

        img {
            width: 70px;
        }

        .navbar-nav {
            flex-direction: column;

            li {
                margin: .2rem 0;
            }
            icon {
                margin-left: .5rem;
            }
        }
    }
}


footer {
    padding: 1rem 0;
    border-top: 1px solid #eee;
    font-size: 0.875rem;
    margin-top: 2rem;

    .nav-item {
        & + .nav-item a::before {
            content: "•";
            width: 1rem;
            display: inline-block;
            margin-left: -1.15rem;
        }
        &:first-child {
            margin-left: -1rem;
        }
    }
}
</style>
