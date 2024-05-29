<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

import MessageListGroup from '@/components/MessageListGroup.vue'
import type { Obj } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    request: Obj
  }>(),
  {},
)

const store = useStore()

const error = computed(() => {
  return props.request.error
})

const messages = computed(() => {
  const messages = props.request.messages
  if (messages && messages.length > 0) return messages
  return null
})

function dismiss() {
  store.dispatch('DISMISS_ERROR', props.request)
}
</script>

<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <div>
    <BCardBody>
      <BCardTitle v-t="'api_errors_titles.' + error.name" />

      <em v-t="'api_error.sorry'" />

      <div class="alert alert-info my-3">
        <span v-html="$t('api_error.help')" />
        <br />{{ $t('api_error.info') }}
      </div>

      <!-- FIXME USE DD DL DT -->
      <p class="m-0">
        <strong v-t="'error'" />:
        <code>"{{ error.code }}" {{ error.status }}</code>
      </p>
      <p>
        <strong v-t="'action'" />:
        <code>"{{ error.method }}" {{ error.path }}</code>
      </p>

      <p>
        <strong v-t="'api_error.error_message'" />
        <BAlert :model-value="true" class="mt-2" variant="danger">
          <div v-html="error.message" />
        </BAlert>
      </p>

      <template v-if="error.traceback">
        <p>
          <strong v-t="'traceback'" />
        </p>
        <pre><code>{{ error.traceback }}</code></pre>
      </template>

      <template v-if="messages">
        <p class="my-2">
          <strong v-t="'api_error.server_said'" />
        </p>
        <MessageListGroup :messages="messages" bordered />
      </template>
    </BCardBody>

    <BCardFooter footer-bg-variant="danger">
      <!-- TODO add copy error ? -->
      <BButton variant="light" size="sm" v-t="'ok'" @click="dismiss" />
    </BCardFooter>
  </div>
</template>

<style lang="scss" scoped>
code,
pre code {
  color: $black;
}
</style>
