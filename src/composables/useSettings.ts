import {
  createGlobalState,
  useLocalStorage,
  watchImmediate,
} from '@vueuse/core'
import { ref } from 'vue'

import {
  getDefaultLocales,
  setI18nFallbackLocale,
  setI18nLocale,
} from '@/i18n/helpers'
import type { SupportedLocales } from '@/i18n/supportedLocales'
import supportedLocales from '@/i18n/supportedLocales'
import type { RouteFromTo } from '@/types/commons'

export const useSettings = createGlobalState(() => {
  const navigatorLocales = getDefaultLocales()
  const localesLoaded = ref(false)

  const locale = useLocalStorage<SupportedLocales>(
    'locale',
    navigatorLocales[0],
  )
  const fallbackLocale = useLocalStorage<SupportedLocales>(
    'fallbackLocale',
    navigatorLocales[1],
  )
  const cache = useLocalStorage('cache', true)
  const transitions = useLocalStorage('transitions', true)
  const dark = useLocalStorage('dark', false)
  const experimental = useLocalStorage('experimental', false)
  const spinner = ref('pacman')
  const transitionName = ref<'slide-right' | 'slide-left' | undefined>()

  watchImmediate([locale, fallbackLocale], async (next, prev) => {
    if (next[0] !== prev[0]) await setI18nLocale(next[0])
    if (next[1] !== prev[1]) await setI18nFallbackLocale(next[1])
    localesLoaded.value = true
  })
  watchImmediate(dark, (dark) => {
    document.documentElement.setAttribute(
      'data-bs-theme',
      dark ? 'dark' : 'light',
    )
  })

  function updateTransitionName({ to, from }: RouteFromTo) {
    // Use the breadcrumb array length as a direction indicator
    const toDepth = (to.meta.breadcrumb || []).length
    const fromDepth = (from.meta.breadcrumb || []).length
    transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left'
  }

  return {
    localesLoaded,

    locale,
    fallbackLocale,
    cache,
    transitions,
    dark,
    experimental,
    spinner,
    transitionName,

    availableLocales: Object.entries(supportedLocales).map(
      ([locale, { name }]) => {
        return { value: locale, text: name }
      },
    ),

    updateTransitionName,
  }
})
