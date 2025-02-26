<script setup lang="ts">
import { reactive } from 'vue'

import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest } from '@/composables/useRequests'
import type { ReconnectionArgs } from '@/composables/useSSE'

defineProps<{
  reconnecting: ReconnectionArgs['origin']
}>()

const request = reactive<{
  title: APIRequest['title']
  status: APIRequest['status']
}>({
  status: 'pending',
  title: 'reconnecting',
})
</script>

<template>
  <ModalOverlay :request="request as APIRequest" hide-footer>
    <h5 v-t="'api.reconnecting.title'" class="text-center my-4" />

    <YSpinner class="mb-4" />

    <!-- 
     i18n: api.reconnecting.reason.reboot
     i18n: api.reconnecting.reason.shutdown
     i18n: api.reconnecting.reason.unknown
     i18n: api.reconnecting.reason.upgrade_system
    -->
    <YAlert
      v-if="!!reconnecting"
      v-t="'api.reconnecting.reason.' + reconnecting"
      :variant="reconnecting === 'unknown' ? 'warning' : 'info'"
    />
  </ModalOverlay>
</template>
