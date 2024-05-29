<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'

import api from '@/api'
import { useStoreGetters } from '@/store/utils'
import LoginView from '@/views/LoginView.vue'

const store = useStore()

const { reconnecting } = useStoreGetters()
const status = ref('reconnecting')
const origin = ref(reconnecting.value.origin || 'unknown')

function tryToReconnect(initialDelay = 0) {
  status.value = 'reconnecting'
  api
    .tryToReconnect({ ...reconnecting.value, initialDelay })
    .then(() => {
      store.commit('SET_RECONNECTING', null)
    })
    .catch((err) => {
      if (err.name === 'APIUnauthorizedError') {
        status.value = 'expired'
      } else {
        status.value = 'failed'
      }
    })
}

tryToReconnect(reconnecting.value.initialDelay)
</script>

<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <BCardBody>
    <BCardTitle class="text-center my-4" v-t="'api.reconnecting.title'" />

    <template v-if="status === 'reconnecting'">
      <YSpinner class="mb-4" />

      <BAlert
        :modelValue="!!origin"
        v-t="'api.reconnecting.reason.' + origin"
        :variant="origin === 'unknow' ? 'warning' : 'info'"
      />
    </template>

    <template v-if="status === 'failed'">
      <BAlert :modelValue="true" variant="danger">
        <MarkdownItem :label="$t('api.reconnecting.failed')" />
      </BAlert>

      <div class="d-flex justify-content-end">
        <BButton
          variant="success"
          v-t="'retry'"
          class="ms-auto"
          @click="tryToReconnect()"
        />
      </div>
    </template>

    <template v-if="status === 'expired'">
      <BAlert
        :modelValue="true"
        variant="success"
        v-t="'api.reconnecting.session_expired'"
      />

      <LoginView force-reload />
    </template>
  </BCardBody>
</template>
