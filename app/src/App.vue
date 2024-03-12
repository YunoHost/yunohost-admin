<template>
  <div id="app" class="container">
    <!-- HEADER -->
    <header>
      <BNavbar>
        <BNavbarBrand
          :to="{ name: 'home' }"
          :disabled="waiting"
          exact-active-class="active"
        >
          <span v-if="theme">
            <img alt="YunoHost logo" src="./assets/logo_light.png" width="40" />
          </span>
          <span v-else>
            <img alt="YunoHost logo" src="./assets/logo_dark.png" width="40" />
          </span>
        </BNavbarBrand>

        <BNavbarNav class="ml-auto">
          <li class="nav-item">
            <BButton :href="ssoLink" variant="primary" size="sm" block>
              {{ $t('user_interface_link') }} <YIcon iname="user" />
            </BButton>
          </li>

          <li class="nav-item" v-show="connected">
            <BButton
              @click.prevent="logout"
              variant="outline-dark"
              block
              size="sm"
            >
              {{ $t('logout') }} <YIcon iname="sign-out" />
            </BButton>
          </li>
        </BNavbarNav>
      </BNavbar>
    </header>

    <!-- MAIN -->
    <ViewLockOverlay>
      <YBreadcrumb />

      <main id="main">
        <!-- The `key` on RouterView make sure that if a link points to a page that
        use the same component as the previous one, it will be refreshed -->
        <RouterView v-slot="{ Component }" :key="routerKey">
          <Transition v-if="transitions" :name="transitionName">
            <Component :is="Component" class="animated" />
          </Transition>
          <Component v-else :is="Component" class="static" />
        </RouterView>
      </main>
    </ViewLockOverlay>

    <!-- HISTORY CONSOLE -->
    <HistoryConsole />

    <!-- FOOTER -->
    <footer class="py-3 mt-auto">
      <nav>
        <BNav class="justify-content-center">
          <BNavItem
            href="https://yunohost.org/docs"
            target="_blank"
            link-classes="text-secondary"
          >
            <YIcon iname="book" /> {{ $t('footer.documentation') }}
          </BNavItem>
          <BNavItem
            href="https://yunohost.org/help"
            target="_blank"
            link-classes="text-secondary"
          >
            <YIcon iname="life-ring" /> {{ $t('footer.help') }}
          </BNavItem>
          <BNavItem
            href="https://donate.yunohost.org/"
            target="_blank"
            link-classes="text-secondary"
          >
            <YIcon iname="heart" /> {{ $t('footer.donate') }}
          </BNavItem>

          <BNavText
            v-if="yunohost"
            id="yunohost-version"
            class="ml-md-auto text-center"
          >
            <span v-html="$t('footer_version', yunohost)" />
          </BNavText>
        </BNav>
      </nav>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { HistoryConsole, ViewLockOverlay } from '@/views/_partials'

export default {
  name: 'App',

  components: {
    HistoryConsole,
    ViewLockOverlay,
  },

  computed: {
    ...mapGetters([
      'connected',
      'yunohost',
      'routerKey',
      'transitions',
      'transitionName',
      'waiting',
      'theme',
      'ssoLink',
    ]),
  },

  methods: {
    async logout() {
      this.$store.dispatch('LOGOUT')
    },
  },

  // This hook is only triggered at page first load
  created() {
    this.$store.dispatch('ON_APP_CREATED')
  },

  mounted() {
    // Unlock copypasta on log view
    const copypastaCode = ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']
    let copypastastep = 0
    document.addEventListener('keydown', ({ key }) => {
      if (key === copypastaCode[copypastastep++]) {
        if (copypastastep === copypastaCode.length) {
          document
            .getElementsByClassName('unselectable')
            .forEach((element) => element.classList.remove('unselectable'))
          copypastastep = 0
        }
      } else {
        copypastastep = 0
      }
    })

    // Konamicode ;P
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]
    let konamistep = 0
    document.addEventListener('keydown', ({ key }) => {
      if (key === konamiCode[konamistep++]) {
        if (konamistep === konamiCode.length) {
          this.$store.commit('SET_SPINNER', 'nyancat')
          konamistep = 0
        }
      } else {
        konamistep = 0
      }
    })

    // April fools easter egg ;)
    const today = new Date()
    if (today.getDate() === 1 && today.getMonth() + 1 === 4) {
      this.$store.commit('SET_SPINNER', 'magikarp')
    }

    // Halloween easter egg ;)
    if (today.getDate() === 31 && today.getMonth() + 1 === 10) {
      this.$store.commit('SET_SPINNER', 'spookycat')
    }

    document.documentElement.setAttribute('dark-theme', this.theme) // updates the data-theme attribute
  },
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
        margin: 0.2rem 0;
      }
    }
  }
}

main {
  position: relative;

  // Routes transition
  .animated {
    transition: all 0.15s ease-in-out;
  }
  .slide-left-enter-from,
  .slide-right-leave-active {
    position: absolute;
    width: 100%;
    top: 0;
    transform: translate(100vw, 0);
  }
  .slide-left-leave-active,
  .slide-right-enter-from {
    position: absolute;
    width: 100%;
    top: 0;
    transform: translate(-100vw, 0);
  }
  // hack to hide last transition provoqued by the <RouterView> element change
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
  border-top: $thin-border;
  font-size: $font-size-sm;
  margin-top: 2rem;

  .nav-item {
    & + .nav-item a::before {
      content: '•';
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
