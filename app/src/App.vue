<template>
  <div id="app" class="container">
    <header>
      <b-navbar>
        <b-navbar-brand to="/" exact exact-active-class="active">
          <img alt="Yunohost logo" src="./assets/logo.png">
        </b-navbar-brand>
        <b-navbar-nav class="ml-auto">
          <li class="nav-item">
            <b-button href="/yunohost/sso"
                      variant="primary" size="sm" block
            >
              {{ $t('user_interface_link') }} <icon iname="user" />
            </b-button>
          </li>
          <li class="nav-item" v-show="connected">
            <b-button @click.prevent="logout" to="/logout"
                      variant="outline-dark" block size="sm"
            >
              {{ $t('logout') }} <icon iname="sign-out" />
            </b-button>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </header>

    <breadcrumb v-if="$route.meta.breadcrumb" />

    <main id="main">
      <router-view v-if="isReady" />
    </main>

    <footer>
      <nav>
        <b-nav>
          <b-nav-item href="https://yunohost.org/docs" target="_blank" link-classes="text-secondary">
            <icon iname="book" /> Documentation
          </b-nav-item>
          <b-nav-item href="https://yunohost.org/help" target="_blank" link-classes="text-secondary">
            <icon iname="life-ring" /> Need help?
          </b-nav-item>
          <b-nav-item href="https://donate.yunohost.org/" target="_blank" link-classes="text-secondary">
            <icon iname="heart" /> Donate
          </b-nav-item>
          <i18n v-if="yunohost" path="footer_version" tag="b-nav-text"
                id="yunohost-version" class="ml-auto"
          >
            <template v-slot:ynh>
              <b-link href="https://yunohost.org">
                YunoHost
              </b-link>
            </template>
            <template v-slot:version>
              {{ yunohost.version }}
            </template>
            <template v-slot:repo>
              {{ yunohost.repo }}
            </template>
          </i18n>
        </b-nav>
      </nav>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',

  data () {
    return {
      // isReady blocks the rendering of the rooter-view until we have a true info
      // about the connected state of the user.
      isReady: false
    }
  },

  computed: {
    ...mapGetters(['connected', 'yunohost'])
  },

  methods: {
    async logout () {
      this.$store.dispatch('LOGOUT').then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  },

  // This hook is only triggered at page first load
  async created () {
    // Save user locales in store
    const { locale, fallbackLocale } = this.$i18n
    this.$store.dispatch('INIT_LOCALES', { locale, fallbackLocale })

    // From this hook the value of `connected` always come from the localStorage.
    if (!this.connected) {
      // user is not connected: allow the login view to be rendered.
      this.isReady = true
      return
    }
    // localStorage 'connected' value may be true, but session may have expired.
    // Try to get the yunohost version.
    this.$store.dispatch(
      'GET_YUNOHOST_INFOS'
    ).catch(() => {
      // Session expired, reset the 'connected' state and redirect with a query
      // FIXME is there a case where the error may not be a 401 therefor requires
      // better handling ?
      this.$store.dispatch('RESET_CONNECTED')
      this.$router.push({
        name: 'login',
        query: { redirect: this.$route.path !== '/login' ? this.$route.path : '/' }
      })
    }).finally(() => {
      // in any case allow the router-view to be rendered
      this.isReady = true
    })
  }
}
</script>

<style lang="scss">
@import '@/scss/main.scss';

#app > header {
  border-bottom: $thin-border;
  padding-top: 1rem;
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

#app > footer {
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
