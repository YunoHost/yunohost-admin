<template>
  <div id="app" class="container">
    <!-- HEADER -->
    <header>
      <b-navbar>
        <b-navbar-brand
          :to="{ name: 'home' }" :disabled="waiting"
          exact exact-active-class="active"
        >
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
    <api-wait-overlay>
      <breadcrumb />

      <main id="main">
        <!-- The `key` on router-view make sure that if a link points to a page that
        use the same component as the previous one, it will be refreshed -->
        <transition v-if="transitions" :name="transitionName">
          <router-view class="animated" :key="$route.fullPath" />
        </transition>
        <router-view v-else class="static" :key="$route.fullPath" />
      </main>
    </api-wait-overlay>

    <!-- CONSOLE/HISTORY -->
    <ynh-console />

    <!-- FOOTER -->
    <footer class="py-3 mt-auto">
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

          <b-nav-text
            v-if="yunohost" id="yunohost-version" class="ml-md-auto text-center"
            v-html="$t('footer_version', yunohost)"
          />
        </b-nav>
      </nav>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ApiWaitOverlay from '@/components/ApiWaitOverlay'
import YnhConsole from '@/components/YnhConsole'

export default {
  name: 'App',

  data () {
    return {
      transitionName: null
    }
  },

  computed: {
    ...mapGetters(['connected', 'yunohost', 'transitions', 'waiting'])
  },

  watch: {
    // Set the css class to animate the components transition
    '$route' (to, from) {
      if (!this.transitions || from.name === null) return
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

  components: {
    ApiWaitOverlay,
    YnhConsole
  },

  // This hook is only triggered at page first load
  created () {
    // From this hook the value of `connected` always come from the localStorage.
    // This state may be `true` but session may have expired, by querying
    // yunohost infos, api may respond with `Unauthorized` in which case the `connected`
    // state will be automaticly reseted and user will be prompt with the login view.
    if (this.connected) {
      this.$store.dispatch('GET_YUNOHOST_INFOS')
    }
  },

  mounted () {
    // Konamicode ;P
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let step = 0
    document.addEventListener('keydown', ({ key }) => {
      if (key === konamiCode[step++]) {
        if (step === konamiCode.length) {
          this.$store.commit('SET_SPINNER', 'nyancat')
          step = 0
        }
      } else {
        step = 0
      }
    })

    // April fools easter egg ;)
    const today = new Date()
    if (today.getDate() === 1 && today.getMonth() + 1 === 4) {
      this.$store.commit('SET_SPINNER', 'magikarp')
    }
  }
}
</script>

<style lang="scss">
// Global import of Bootstrap and custom styles
@import '@/scss/main.scss';
</style>

<style lang="scss" scoped>
// generic style for <html>, <body> and <#app> is in `scss/main.scss`
header {
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

#console {
  // Allows the console to be tabbed before the footer links while remaining visually
  // the last element of the page
  order: 3;
}

footer {
  border-top: 1px solid #eee;
  font-size: $font-size-sm;
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
