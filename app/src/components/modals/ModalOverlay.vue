<script setup lang="ts">
import type { APIRequest } from '@/composables/useRequests'

withDefaults(
  defineProps<{
    request: APIRequest
    hideFooter?: boolean
  }>(),
  {
    hideFooter: true,
  },
)

const emit = defineEmits<{
  dismiss: [value: boolean]
}>()

defineSlots<{
  default(props: Record<string, any>): any
  footer(props: Record<string, any>): any
}>()
</script>

<template>
  <BModal
    :model-value="true"
    class="modal-overlay"
    centered
    hide-backdrop
    no-close-on-backdrop
    no-close-on-esc
    :hide-footer="hideFooter"
  >
    <template #header>
      <QueryHeader type="overlay" :request="request" tabindex="0" />
    </template>

    <slot name="default" />

    <template #footer>
      <slot name="footer">
        <BButton
          v-t="'ok'"
          variant="light"
          size="sm"
          @click="emit('dismiss', true)"
        />
      </slot>
    </template>
  </BModal>
</template>

<style lang="scss">
.modal-overlay {
  .modal-header {
    padding: 0.5rem 0.75rem;
  }
  &-status {
    display: inline-block;
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
}
</style>
