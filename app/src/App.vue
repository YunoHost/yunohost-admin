<script setup lang="ts">
import { useToastController } from 'bootstrap-vue-next'
import { onMounted, ref } from 'vue'

import { useAutoToast } from '@/composables/useAutoToast'
import { useInfos } from '@/composables/useInfos'
import { useRequests } from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'
import { HistoryConsole } from '@/views/_partials'

useAutoToast().init(useToastController())
const { ssoLink, connected, yunohost, logout, onAppCreated } = useInfos()
const { locked } = useRequests()
const { spinner, dark } = useSettings()

const ready = ref(false)
onAppCreated().finally(() => (ready.value = true))

onMounted(() => {
  const copypastaCode = ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']
  let copypastastep = 0
  document.addEventListener('keydown', ({ key }) => {
    if (key === copypastaCode[copypastastep++]) {
      if (copypastastep === copypastaCode.length) {
        document
          .querySelectorAll('.unselectable')
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
        spinner.value = 'nyancat'
        konamistep = 0
      }
    } else {
      konamistep = 0
    }
  })

  const today = new Date()

  // International Transgender Day of Visibility ;)
   if (today.getDate() === 31 && today.getMonth() + 1 === 3) {
    spinner.value = 'transcat'
  }

  // April fools easter egg ;)
  if (today.getDate() === 1 && today.getMonth() + 1 === 4) {
    spinner.value = 'magikarp'
  }

  // Halloween easter egg ;)
  if (today.getDate() === 31 && today.getMonth() + 1 === 10) {
    spinner.value = 'spookycat'
  }
})
</script>

<template>
  <div id="app" class="container">
    <!-- HEADER -->
    <header>
      <BNavbar>
        <BNavbarBrand
          :to="{ name: 'home' }"
          :disabled="locked"
          exact-active-class="active"
        >
          <span v-if="dark">
            <img alt="YunoHost logo" src="./assets/logo_light.png" width="40" />
          </span>
          <span v-else>
            <img alt="YunoHost logo" src="./assets/logo_dark.png" width="40" />
          </span>
        </BNavbarBrand>

        <BNavbarNav class="ms-auto">
          <li class="nav-item">
            <BButton
              :href="ssoLink"
              variant="primary"
              size="sm"
              class="d-block"
            >
              {{ $t('user_interface_link') }} <YIcon iname="user" />
            </BButton>
          </li>

          <li v-show="connected" class="nav-item">
            <BButton
              variant="outline-dark"
              block
              size="sm"
              @click.prevent="logout"
            >
              {{ $t('logout') }} <YIcon iname="sign-out" />
            </BButton>
          </li>
        </BNavbarNav>
      </BNavbar>
    </header>

    <!-- MAIN -->
    <MainLayout v-if="ready" />

    <BModalOrchestrator />
    <BToastOrchestrator />

    <!-- HISTORY CONSOLE -->
    <HistoryConsole />

    <!-- FOOTER -->
    <div class="mt-4" />
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
            href="https://yunohost.org/terms_of_services"
            target="_blank"
            link-classes="text-secondary"
          >
            <YIcon iname="legal" /> {{ $t('footer.tos') }}
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
            class="ms-md-auto text-center"
          >
            <span v-html="$t('footer_version', yunohost)" />
          </BNavText>
        </BNav>
      </nav>
    </footer>
  </div>
</template>

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

#console {
  // Allows the console to be tabbed before the footer links while remaining visually
  // the last element of the page
  order: 3;
}

footer {
  border-top: $thin-border;
  font-size: $font-size-sm;

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
