<template>
  <div id="app" class="container">
    <!-- HEADER -->
    <header>
      <b-navbar>
        <b-navbar-brand :to="{ name: 'home' }" exact exact-active-class="active">
          <img alt="Yunohost logo" src="./assets/logo.png">
        </b-navbar-brand>

        <b-navbar-nav class="ml-auto">
          <li class="nav-item">
            <b-button
              href="/yunohost/sso"
              variant="primary" size="sm" block
            >
              {{ $t('user_interface_link') }} <icon iname="user" />
            </b-button>
          </li>

          <li class="nav-item" v-show="connected">
            <b-button
              @click.prevent="logout"
              variant="outline-dark" block size="sm"
            >
              {{ $t('logout') }} <icon iname="sign-out" />
            </b-button>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </header>

    <!-- MAIN -->
    <breadcrumb />

    <main id="main">
      <transition v-if="transitions" :name="transitionName">
        <router-view class="animated" />
      </transition>
      <router-view v-else class="static" />
    </main>

    <!-- FOOTER -->
    <footer>
      <nav>
        <b-nav class="justify-content-center">
          <b-nav-item href="https://yunohost.org/docs" target="_blank" link-classes="text-secondary">
            <icon iname="book" /> {{ $t('footer.documentation') }}
          </b-nav-item>
          <b-nav-item href="https://yunohost.org/help" target="_blank" link-classes="text-secondary">
            <icon iname="life-ring" /> {{ $t('footer.help') }}
          </b-nav-item>
          <b-nav-item href="https://donate.yunohost.org/" target="_blank" link-classes="text-secondary">
            <icon iname="heart" /> {{ $t('footer.donate') }}
          </b-nav-item>
          <i18n
            v-if="yunohost" path="footer.version" tag="b-nav-text"
            id="yunohost-version" class="ml-md-auto text-center"
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
      transitionName: null
    }
  },

  computed: {
    ...mapGetters(['connected', 'yunohost', 'transitions'])
  },

  watch: {
    // Set the css class to animate the components transition
    '$route' (to, from) {
      if (!this.transitions) return
      // Use the breadcrumb array length as a direction indicator
      const toDepth = to.meta.breadcrumb.length
      const fromDepth = from.meta.breadcrumb.length
      this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  },

  methods: {
    async logout () {
      this.$store.dispatch('LOGOUT')
    }
  },

  // This hook is only triggered at page first load
  async created () {
    // From this hook the value of `connected` always come from the localStorage.
    // This state may be `true` but session may have expired, by querying
    // yunohost infos, api may respond with `Unauthorized` in which case the `connected`
    // state will be automaticly reseted and user will be prompt with the login view.
    if (this.connected) {
      this.$store.dispatch('GET_YUNOHOST_INFOS')
    }
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

main {
  position: relative;

  // Routes transition
  .animated {
    transition: all .15s ease-in-out;
  }
  .slide-left-enter, .slide-right-leave-active {
    position: absolute;
    width: 100%;
    top: 0;
    transform: translate(100vw, 0);
  }
  .slide-left-leave-active, .slide-right-enter {
    position: absolute;
    width: 100%;
    top: 0;
    transform: translate(-100vw, 0);
  }
  // hack to hide last transition provoqued by the <router-view> element change
  // while disabling the transitions in ToolWebAdmin
  .static ~ .animated {
    display: none;
  }
}
</style>
