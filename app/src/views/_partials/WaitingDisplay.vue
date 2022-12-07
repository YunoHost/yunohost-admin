<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <b-card-body>
    <b-card-title class="text-center mt-4" v-t="hasMessages ? 'api.processing' : 'api_waiting'" />

    <!-- PROGRESS BAR -->
    <b-progress
      v-if="progress" class="my-4"
      :max="progress.max" height=".5rem"
    >
      <b-progress-bar variant="success" :value="progress.values[0]" />
      <b-progress-bar variant="warning" :value="progress.values[1]" animated />
      <b-progress-bar variant="secondary" :value="progress.values[2]" striped />
    </b-progress>
    <!-- OR SPINNER -->
    <spinner v-else class="my-4" />

    <message-list-group
      v-if="hasMessages" :messages="request.messages"
      bordered fixed-height auto-scroll
      :limit="100"
    />
  </b-card-body>
</template>

<script>
import MessageListGroup from '@/components/MessageListGroup.vue'

export default {
  name: 'WaitingDisplay',

  components: {
    MessageListGroup
  },

  props: {
    request: { type: Object, required: true }
  },

  computed: {
    hasMessages () {
      return this.request.messages && this.request.messages.length > 0
    },

    progress () {
      const progress = this.request.progress
      if (!progress) return null
      return {
        values: progress,
        max: progress.reduce((sum, value) => (sum + value), 0)
      }
    }
  }
}
</script>
