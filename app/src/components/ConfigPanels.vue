<script setup lang="ts">
import { useVuelidate, type BaseValidation } from '@vuelidate/core'
import { computed, defineAsyncComponent, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { CustomRoute, Obj } from '@/types/commons'

defineOptions({
  inheritAttrs: false,
})

const RoutableTabs = defineAsyncComponent(
  () => import('@/components/RoutableTabs.vue'),
)

const props = withDefaults(
  defineProps<{
    panels: Obj[]
    forms: Obj<Obj>
    validations: BaseValidation
    externalResults: Obj
    errors?: Obj // never used
    noRedirect?: boolean
    routes?: CustomRoute[]
  }>(),
  {
    errors: undefined,
    routes: undefined,
    noRedirect: false,
  },
)

const slots = defineSlots<{
  'tab-top': any
  'tab-before': any
  'tab-after': any
}>()

const externalResults = toRef(props, 'externalResults')
const rules = computed(() => ({ forms: props.validations }))
const v$ = useVuelidate(rules, props.forms, {
  $externalResults: externalResults,
})

const router = useRouter()
const route = useRoute()
const routes = computed(() => {
  return (
    props.routes ||
    props.panels.map((panel) => ({
      to: { params: { tabId: panel.id } },
      text: panel.name,
      icon: panel.icon || 'wrench',
    }))
  )
})

if (!props.noRedirect && !route.params.tabId) {
  router.replace({ params: { tabId: props.panels[0].id } })
}
</script>

<template>
  <div class="config-panel">
    <!-- FIXME vue3 - weird stuff with event binding, need to propagate by hand for now -->
    <RoutableTabs
      v-if="routes.length > 1"
      v-bind="{ panels, forms, v: v$, ...$attrs }"
      :routes="routes"
    >
      <template #tab-top>
        <slot name="tab-top" />
      </template>
      <template #tab-before>
        <slot name="tab-before" />
      </template>
      <template #tab-after>
        <slot name="tab-after" />
      </template>
    </RoutableTabs>

    <YCard v-else :title="routes[0].text" :icon="routes[0].icon">
      <slot name="tab-top" />
      <slot name="tab-before" />
      <slot name="tab-after" />
    </YCard>
  </div>
</template>
