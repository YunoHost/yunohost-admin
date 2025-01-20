<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalOverlay from '@/components/modals/ModalOverlay.vue'
import type { APIRequest } from '@/composables/useRequests'

const props = defineProps<{
  request: APIRequest
}>()

const { t } = useI18n()

const messages = computed(() => {
  const messages = props.request.action?.messages
  return messages?.length ? messages : null
})

const progress = computed(() => {
  const progress = props.request.action?.progress
  if (!progress) return null
  return {
    values: progress,
    max: progress.reduce((sum, value) => sum + value, 0),
  }
})

const title = computed(() => {
  if (messages.value || progress.value) return t('api.processing')
  if (props.request.id.startsWith('lock')) return t('api.busy')
  return t('api_waiting')
})
</script>

<template>
  <ModalOverlay :request="request">
    <h5 class="text-center mt-4">{{ title }}</h5>

    <BProgress v-if="progress" :max="progress.max" height=".5rem" class="my-4">
      <BProgressBar variant="success" :value="progress.values[0]" />
      <BProgressBar variant="warning" :value="progress.values[1]" animated />
      <BProgressBar variant="secondary" :value="progress.values[2]" striped />
    </BProgress>
    <YSpinner v-else class="my-4" />

    <MessageListGroup
      v-if="messages"
      auto-scroll
      bordered
      fixed-height
      :limit="100"
      :messages="messages"
    />
  </ModalOverlay>
</template>
