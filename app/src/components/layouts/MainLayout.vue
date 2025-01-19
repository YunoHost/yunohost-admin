<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import type { VNode } from 'vue'
import { computed, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import {
  ModalError,
  ModalReconnecting,
  ModalWaiting,
} from '@/components/modals'
import { useInfos } from '@/composables/useInfos'
import { useRequests } from '@/composables/useRequests'
import { useSSE } from '@/composables/useSSE'
import { useSettings } from '@/composables/useSettings'
import type { CustomRoute, Skeleton, VueClass } from '@/types/commons'

const { t } = useI18n()
const router = useRouter()
const { routerKey, hasSuspenseError } = useInfos()
const { currentRequest, dismissModal } = useRequests()
const { transitions, transitionName, dark } = useSettings()
const { reconnecting } = useSSE()

const RootView = createReusableTemplate<{
  Component: VNode
  classes: VueClass
}>()
const FallbackView = createReusableTemplate()

const quickAddItems: CustomRoute[] = [
  { text: t('users_add'), to: { name: 'user-create' } },
  { text: t('domain_add'), to: { name: 'domain-add' } },
  { text: t('group_add'), to: { name: 'group-create' } },
  { text: t('install_app'), to: { name: 'app-catalog' } },
]

const skeletons = computed<Skeleton[]>(() => {
  const skeleton = router.currentRoute.value.meta.skeleton ?? 'CardInfoSkeleton'
  const skeletons = Array.isArray(skeleton) ? skeleton : [skeleton]
  return skeletons.map((skeleton) =>
    typeof skeleton === 'string' ? { is: skeleton } : skeleton,
  )
})

const modalComponent = computed(() => {
  if (reconnecting.value) {
    return {
      is: ModalReconnecting,
      props: { reconnecting: reconnecting.value },
    }
  }

  const request = currentRequest.value
  if (!request) return null
  const { status, err } = request

  if (status === 'error' && err) {
    return {
      is: ModalError,
      props: { request, onDismiss: () => dismissModal(request.id) },
    }
  } else {
    return { is: ModalWaiting, props: { request } }
  }
})

onErrorCaptured((e) => {
  // If an error occurs in an async view when calling the api it will prevent
  // the component to show up and will block the entire app.
  // So we prevent the view to try to show itself and display the skeleton instead,
  // the error modal will show up and lock the view or propose to go back.
  hasSuspenseError.value = true
  console.error(e)
})
</script>

<template>
  <FallbackView.define>
    <template v-for="({ is, ...props }, i) in skeletons" :key="i">
      <Component :is="is" v-bind="props" :class="{ 'mt-3': i !== 0 }" />
    </template>
  </FallbackView.define>

  <RootView.define v-slot="{ Component, classes }">
    <BOverlay
      opacity="0.75"
      rounded
      :show="!!modalComponent"
      :variant="dark ? 'dark' : 'light'"
      class="main-overlay"
    >
      <Suspense>
        <FallbackView.reuse v-if="hasSuspenseError" />
        <Component :is="Component" v-else :class="classes" />
        <template #fallback>
          <FallbackView.reuse />
        </template>
      </Suspense>

      <template v-if="modalComponent" #overlay>
        <Component :is="modalComponent.is" v-bind="modalComponent.props" />
      </template>
    </BOverlay>
  </RootView.define>

  <div class="d-flex align-items-center mt-2 mb-4">
    <YBreadcrumb />

    <BDropdown
      v-if="router.currentRoute.value.name === 'home'"
      variant="success"
      class="ms-auto"
    >
      <template #button-content>
        <YIcon iname="plus" /> {{ t('quick_action') }}
      </template>
      <template v-for="(item, i) in quickAddItems" :key="i">
        <BDropdownItem :to="item.to">
          <YIcon iname="plus" /> {{ item.text }}
        </BDropdownItem>
      </template>
    </BDropdown>
  </div>

  <main id="main">
    <!-- The `key` on RouterView make sure that if a link points to a page that
        use the same component as the previous one, it will be refreshed -->
    <RouterView v-slot="{ Component }" :key="routerKey">
      <Transition v-if="transitions" :name="transitionName">
        <RootView.reuse v-bind="{ Component, classes: 'animated' }" />
      </Transition>
      <RootView.reuse v-else v-bind="{ Component, classes: 'static' }" />
    </RouterView>
  </main>
</template>

<style lang="scss" scoped>
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

  .main-overlay :deep(.b-overlay :first-child) {
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    transform: translate(-10px, -10px);
  }
}
</style>
