<template>
  <div class="config-panel">
    <routable-tabs
      v-if="routes_.length > 1"
      :routes="routes_"
      v-bind="{ panels, forms, v: $v, ...$attrs }"
      v-on="$listeners"
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
    </routable-tabs>

    <card v-else :title="routes_[0].text" :icon="routes_[0].icon">
      <slot name="tab-top" />
      <slot name="tab-before" />
      <slot name="tab-after" />
    </card>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'

export default {
  name: 'ConfigPanels',

  components: {
    RoutableTabs: () => import('@/components/RoutableTabs.vue')
  },

  mixins: [validationMixin],

  props: {
    panels: { type: Array, default: undefined },
    forms: { type: Object, default: undefined },
    validations: { type: Object, default: undefined },
    errors: { type: Object, default: undefined }, // never used
    routes: { type: Array, default: null },
    noRedirect: { type: Boolean, default: false }
  },

  computed: {
    routes_ () {
      if (this.routes) return this.routes
      return this.panels.map(panel => ({
        to: { params: { tabId: panel.id } },
        text: panel.name,
        icon: panel.icon || 'wrench'
      }))
    }
  },

  validations () {
    return { forms: this.validations }
  },

  created () {
    if (!this.noRedirect && !this.$route.params.tabId) {
      this.$router.replace({ params: { tabId: this.panels[0].id } })
    }
  }
}
</script>
