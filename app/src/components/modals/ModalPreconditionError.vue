<script setup lang="ts">
import { APIError } from '@/api/errors'
import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest } from '@/composables/useRequests'

const props = defineProps<{
  request: APIRequest & { err: APIError }
}>()

const { err, messages } = (() => {
  const { err, action } = props.request
  return {
    err: err,
    messages: action?.messages.length ? action.messages : null,
  }
})()
</script>

<template>
  <ModalOverlay
    :request="request"
    footer-variant="danger"
    class="modal-precondition-failed"
    :hide-footer="false"
  >
    <p>
      <YAlert variant="danger" class="mt-2 p-0 border-0">
        <div v-html="err.message" />
      </YAlert>
    </p>

    <div v-if="messages">
      <p class="my-2"><strong v-t="'api_error.server_said'" /></p>
      <MessageListGroup :messages="messages" bordered fixed-height />
    </div>
  </ModalOverlay>
</template>

<style>
/* FIXME Meh */
.modal-precondition-failed .modal-body {
  background-color: var(--bs-danger-bg-subtle);
  color: var(--bs-danger-text-emphasis);
}
</style>
