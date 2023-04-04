<template>
  <div>
    <top-bar v-if="hasTopBar">
      <template #group-left>
        <slot name="top-bar-group-left" />
      </template>
      <template #group-right>
        <slot name="top-bar-group-right" />
      </template>
    </top-bar>
    <slot v-else name="top-bar" />

    <slot name="top" v-bind="{ loading: isLoading }" />

    <b-skeleton-wrapper :loading="isLoading">
      <template #loading>
        <slot name="skeleton">
          <component :is="skeleton" />
        </slot>
      </template>

      <!-- Empty div to be able to receive multiple components -->
      <div>
        <slot name="default" v-bind="{ loading: isLoading }" />
      </div>
    </b-skeleton-wrapper>

    <slot name="bot" v-bind="{ loading: isLoading }" />
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'ViewBase',

  props: {
    queries: { type: Array, default: null },
    queriesWait: { type: Boolean, default: false },
    skeleton: { type: [String, Array], default: null },
    // Optional prop to take control of the loading value
    loading: { type: Boolean, default: null }
  },

  data () {
    return {
      fallback_loading: this.loading === null && this.queries !== null ? true : null
    }
  },

  computed: {
    isLoading () {
      if (this.loading !== null) return this.loading
      return this.fallback_loading
    },

    hasTopBar () {
      return ['top-bar-group-left', 'top-bar-group-right'].some(slotName => (slotName in this.$slots))
    }
  },

  methods: {
    fetchQueries ({ triggerLoading = false } = {}) {
      if (triggerLoading) {
        this.fallback_loading = true
      }

      api.fetchAll(
        this.queries,
        { wait: this.queriesWait, initial: true }
      ).then(responses => {
        this.$emit('queries-response', ...responses)
        this.fallback_loading = false
      })
    }
  },

  created () {
    if (this.queries) this.fetchQueries()
  }
}
</script>
