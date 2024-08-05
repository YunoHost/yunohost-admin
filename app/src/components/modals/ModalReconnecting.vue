<script setup lang="ts">
import { onMounted, reactive } from 'vue'

import api from '@/api'
import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest, ReconnectingArgs } from '@/composables/useRequests'
import LoginView from '@/views/LoginView.vue'

const props = defineProps<{
  reconnecting: ReconnectingArgs
}>()

const emit = defineEmits<{
  dismiss: [value: boolean]
}>()

const request = reactive<{
  humanRoute: APIRequest['humanRoute']
  status: APIRequest['status']
  subStatus?: 'expired' | 'failed'
}>({
  status: 'pending',
  // FIXME translate
  humanRoute: 'reconnecting',
})

function tryToReconnect() {
  request.status = 'pending'
  request.subStatus = undefined
  api
    .tryToReconnect(props.reconnecting)
    .then(() => {
      emit('dismiss', true)
    })
    .catch((err) => {
      if (err.name === 'APIUnauthorizedError') {
        request.status = 'success'
        request.subStatus = 'expired'
      } else {
        request.status = 'error'
        request.subStatus = 'failed'
      }
    })
}

onMounted(() => {
  tryToReconnect()
})
</script>

<template>
  <ModalOverlay
    :request="request as APIRequest"
    footer-variant="danger"
    :hide-footer="request.subStatus !== 'failed'"
  >
    <h5 v-t="'api.reconnecting.title'" class="text-center my-4" />

    <template v-if="request.status === 'pending'">
      <YSpinner class="mb-4" />

      <YAlert
        v-if="!!reconnecting.origin"
        v-t="'api.reconnecting.reason.' + reconnecting.origin"
        :variant="reconnecting.origin === 'unknown' ? 'warning' : 'info'"
      />
    </template>

    <template v-if="request.subStatus === 'failed'">
      <YAlert variant="danger">
        <MarkdownItem :label="$t('api.reconnecting.failed')" />
      </YAlert>
    </template>
    <template v-if="request.subStatus === 'failed'" #footer>
      <BButton v-t="'retry'" variant="light" @click="tryToReconnect()" />
    </template>

    <template v-if="request.subStatus === 'expired'">
      <YAlert v-t="'api.reconnecting.success'" variant="success" />

      <LoginView force-reload />
    </template>
  </ModalOverlay>
</template>
