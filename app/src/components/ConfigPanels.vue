<template>
  <routable-tabs
    :routes="routes_"
    v-bind="{ panels, forms, v: $v, ...$attrs }"
    v-on="$listeners"
  />
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
