<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

import type { Obj } from '@/types/commons'

const props = defineProps<{
  request: Obj
}>()

const store = useStore()

const warning = computed(() => {
  const messages = props.request.messages
  return messages[messages.length - 1]
})

function dismiss() {
  store.dispatch('DISMISS_WARNING', props.request)
}
</script>
<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <div>
    <BCardBody body-class="alert alert-warning">
      <div v-html="warning.text" />
    </BCardBody>

    <BCardFooter footer-bg-variant="warning">
      <BButton variant="light" size="sm" v-t="'ok'" @click="dismiss" />
    </BCardFooter>
  </div>
</template>

<style lang="scss" scoped>
.card-body {
  padding-bottom: 1.5rem !important;
  margin-bottom: 0;
}
</style>
