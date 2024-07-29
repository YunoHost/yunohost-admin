<script setup lang="ts">
import { computed } from 'vue'

import QueryHeader from '@/components/QueryHeader.vue'
import { useStoreGetters } from '@/store/utils'
import { useSettings } from '@/composables/useSettings'
import {
  ErrorDisplay,
  ReconnectingDisplay,
  WaitingDisplay,
  WarningDisplay,
} from '@/views/_partials'

const { dark } = useSettings()
const { waiting, reconnecting, error, currentRequest } = useStoreGetters()
const component = computed(() => {
  const request = currentRequest.value
  // FIXME should we pass refs or unwrap refs as props?
  if (error.value) {
    return { is: ErrorDisplay, request: error.value }
  } else if (request.showWarningMessage) {
    return { is: WarningDisplay, request: currentRequest.value }
  } else if (reconnecting.value) {
    return { is: ReconnectingDisplay }
  } else {
    return { is: WaitingDisplay, request: currentRequest.value }
  }
})
</script>

<template>
  <BOverlay
    :variant="dark ? 'dark' : 'light'"
    opacity="0.75"
    no-center
    :show="waiting || reconnecting || error !== null"
  >
    <slot name="default" />

    <template #overlay>
      <BCard no-body class="card-overlay">
        <BCardHeader header-bg-variant="white">
          <QueryHeader :request="error || currentRequest" status-size="lg" />
        </BCardHeader>

        <Component :is="component.is" :request="component.request" />
      </BCard>
    </template>
  </BOverlay>
</template>

<style lang="scss" scoped>
// Style for `*Display`'s cards
.card-overlay {
  position: sticky;
  top: 10vh;
  margin: 0 5%;

  @include media-breakpoint-up(md) {
    margin: 0 10%;
  }
  @include media-breakpoint-up(lg) {
    margin: 0 15%;
  }

  :deep(.card-body) {
    padding: 1.5rem;
    padding-bottom: 0;
    max-height: 60vh;
    overflow-y: auto;

    & > :last-child {
      margin-bottom: 1.5rem;
    }
  }

  :deep(.card-footer) {
    padding: 0.5rem 0.75rem;
    display: flex;
    justify-content: flex-end;
  }

  .card-header {
    padding: 0.5rem 0.75rem;
  }
}
</style>
