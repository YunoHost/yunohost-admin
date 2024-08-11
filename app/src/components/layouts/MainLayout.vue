<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import type { VNode } from 'vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import {
  ModalError,
  ModalReconnecting,
  ModalWaiting,
  ModalWarning,
} from '@/components/modals'
import { useInfos } from '@/composables/useInfos'
import { useRequests } from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'
import type { Skeleton, VueClass } from '@/types/commons'

const router = useRouter()
const { routerKey } = useInfos()
const { reconnecting, currentRequest, dismissModal } = useRequests()
const { transitions, transitionName, dark } = useSettings()

const RootView = createReusableTemplate<{
  Component: VNode
  classes: VueClass
}>()

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
      props: {
        reconnecting: reconnecting.value,
        onDismiss: () => (reconnecting.value = undefined),
      },
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
  } else if (status === 'warning') {
    return {
      is: ModalWarning,
      props: { request, onDismiss: () => dismissModal(request.id) },
    }
  } else {
    return { is: ModalWaiting, props: { request } }
  }
})
</script>

<template>
  <RootView.define v-slot="{ Component, classes }">
    <BOverlay
      opacity="0.75"
      rounded
      :show="!!modalComponent"
      :variant="dark ? 'dark' : 'light'"
      class="main-overlay"
    >
      <Suspense>
        <Component :is="Component" :class="classes" />
        <template #fallback>
          <template v-for="({ is, ...props }, i) in skeletons" :key="i">
            <Component :is="is" v-bind="props" />
          </template>
        </template>
      </Suspense>

      <template v-if="modalComponent" #overlay>
        <Component :is="modalComponent.is" v-bind="modalComponent.props" />
      </template>
    </BOverlay>
  </RootView.define>

  <YBreadcrumb />

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
