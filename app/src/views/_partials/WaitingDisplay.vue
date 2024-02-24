<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <BCardBody>
    <BCardTitle class="text-center mt-4" v-t="hasMessages ? 'api.processing' : 'api_waiting'" />

    <!-- PROGRESS BAR -->
    <BProgress
      v-if="progress" class="my-4"
      :max="progress.max" height=".5rem"
    >
      <BProgressBar variant="success" :value="progress.values[0]" />
      <BProgressBar variant="warning" :value="progress.values[1]" animated />
      <BProgressBar variant="secondary" :value="progress.values[2]" striped />
    </BProgress>
    <!-- OR SPINNER -->
    <Spinner v-else class="my-4" />

    <MessageListGroup
      v-if="hasMessages" :messages="request.messages"
      bordered fixed-height auto-scroll
      :limit="100"
    />
  </BCardBody>
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
