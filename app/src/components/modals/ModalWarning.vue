<script setup lang="ts">
import { computed } from 'vue'

import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest } from '@/composables/useRequests'

const props = defineProps<{
  request: APIRequest
}>()

// FIXME probably doesn't need a computed here
const warningMessage = computed(() => {
  const messages = props.request.action!.messages
  return messages[messages.length - 1]
})
</script>

<template>
  <ModalOverlay
    :request="request"
    footer-variant="warning"
    body-variant="warning"
    :hide-footer="false"
  >
    <div v-html="warningMessage.text" />
  </ModalOverlay>
</template>
