<script setup lang="ts">
import { APIError, APIInternalError, APINotRespondingError } from '@/api/errors'
import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest } from '@/composables/useRequests'

const props = defineProps<{
  request: APIRequest & { err: APIError }
}>()

const { err, messages, traceback } = (() => {
  const { err, action } = props.request
  return {
    err: err,
    messages: action?.messages,
    traceback: err instanceof APIInternalError ? err.traceback : null,
  }
})()
</script>

<template>
  <ModalOverlay
    :request="request"
    footer-variant="danger"
    :hide-footer="err instanceof APINotRespondingError"
  >
    <!--
    i18n: api_errors_titles.APIBadRequestError
    i18n: api_errors_titles.APIConnexionError
    i18n: api_errors_titles.APIError
    i18n: api_errors_titles.APIInternalError
    i18n: api_errors_titles.APINotFoundError
    i18n: api_errors_titles.APINotRespondingError
    -->
    <h5 v-t="`api_errors_titles.${err.name}`" />

    <em v-t="'api_error.sorry'" />

    <div class="alert alert-info my-3">
      <span v-html="$t('api_error.help')" />
      <br />{{ $t('api_error.info') }}
    </div>

    <!-- FIXME USE DD DL DT -->
    <p class="m-0">
      <strong v-t="'error'" />:
      <code>"{{ err.code }}" {{ err.status }}</code>
    </p>
    <p>
      <strong v-t="'action'" />:
      <code>"{{ err.method }}" {{ err.path }}</code>
    </p>

    <p>
      <strong v-t="'api_error.error_message'" />
      <YAlert variant="danger" class="mt-2">
        <div v-html="err.message" />
      </YAlert>
    </p>

    <div v-if="traceback">
      <p><strong v-t="'traceback'" /></p>
      <pre><code>{{ traceback }}</code></pre>
    </div>

    <div v-if="messages">
      <p class="my-2"><strong v-t="'api_error.server_said'" /></p>
      <MessageListGroup :messages="messages" bordered fixed-height />
    </div>
  </ModalOverlay>
</template>
