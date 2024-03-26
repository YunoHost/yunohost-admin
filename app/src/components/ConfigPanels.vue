<template>
  <div class="config-panel">
    <!-- FIXME vue3 - weird stuff with event binding, need to propagate by hand for now -->
    <RoutableTabs
      v-if="routes_.length > 1"
      v-bind="{ panels, forms, v: v$, ...$attrs }"
      :routes="routes_"
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

    <YCard v-else :title="routes_[0].text" :icon="routes_[0].icon">
      <slot name="tab-top" />
      <slot name="tab-before" />
      <slot name="tab-after" />
    </YCard>
  </div>
</template>

<script>
import { toRef } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useVuelidate } from '@vuelidate/core'

export default {
  name: 'ConfigPanels',

  inheritAttrs: false,

  components: {
    RoutableTabs: defineAsyncComponent(
      () => import('@/components/RoutableTabs.vue'),
    ),
  },

  props: {
    panels: { type: Array, default: undefined },
    forms: { type: Object, default: undefined },
    validations: { type: Object, default: undefined },
    errors: { type: Object, default: undefined }, // never used
    routes: { type: Array, default: null },
    noRedirect: { type: Boolean, default: false },
    externalResults: { type: Object, required: true },
  },

  setup(props) {
    const externalResults = toRef(props, 'externalResults')
    return {
      v$: useVuelidate({ $externalResults: externalResults }),
    }
  },

  computed: {
    routes_() {
      if (this.routes) return this.routes
      return this.panels.map((panel) => ({
        to: { params: { tabId: panel.id } },
        text: panel.name,
        icon: panel.icon || 'wrench',
      }))
    },
  },

  validations() {
    return { forms: this.validations }
  },

  created() {
    if (!this.noRedirect && !this.$route.params.tabId) {
      this.$router.replace({ params: { tabId: this.panels[0].id } })
    }
  },
}
</script>
