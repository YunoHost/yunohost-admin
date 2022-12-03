<template>
  <routable-tabs
    v-bind="{ panels, forms, v, ...$attrs }"
    :routes="routes_"
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
</template>

<script>
import { useVuelidate } from '@vuelidate/core'

export default {
  name: 'ConfigPanels',

  components: {
    RoutableTabs: () => import('@/components/RoutableTabs.vue')
  },

  props: {
    panels: { type: Array, default: undefined },
    forms: { type: Object, default: undefined },
    validations: { type: Object, default: undefined },
    errors: { type: Object, default: undefined },
    routes: { type: Array, default: null },
    noRedirect: { type: Boolean, default: false }
  },

  data () {
    return {
      // This is used internally by vuelidate to display server side validation errors
      vuelidateExternalResults: { forms: this.errors },
      v: useVuelidate()
    }
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

  methods: {
    onError (err, panelId) {
      if (err.name !== 'APIBadRequestError') throw err
      const panel = this.panels.find(panel => panel.id === panelId)
      if (err.data.name) {
        // Update field's $externalResults to trigger invalid state and error message
        this.vuelidateExternalResults.forms[panelId][err.data.name] = err.message
      } else {
        this.$set(panel, 'serverError', err.message)
      }
    }
  },

  created () {
    if (!this.noRedirect && !this.$route.params.tabId) {
      this.$router.replace({ params: { tabId: this.panels[0].id } })
    }
  }
}
</script>
