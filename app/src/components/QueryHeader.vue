<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

import type { Obj } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    request: Obj
    statusSize?: string
    showTime?: boolean
    showError?: boolean
  }>(),
  {
    statusSize: '',
    showTime: false,
    showError: false,
  },
)

const store = useStore()

const color = computed(() => {
  const statuses = {
    pending: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'danger',
  }
  return statuses[props.request.status]
})

const errorsCount = computed(() => {
  return props.request.messages.filter(({ type }) => type === 'danger').length
})

const warningsCount = computed(() => {
  return props.request.messages.filter(({ type }) => type === 'warning').length
})

function reviewError() {
  store.dispatch('REVIEW_ERROR', props.request)
}

function hour(date: Date) {
  return new Date(date).toLocaleTimeString()
}
</script>

<template>
  <div class="query-header w-100">
    <!-- STATUS -->
    <span
      class="status"
      :class="['bg-' + color, statusSize]"
      :aria-label="$t('api.query_status.' + request.status)"
    />

    <!-- REQUEST DESCRIPTION -->
    <strong class="request-desc">
      {{ request.humanRoute }}
    </strong>

    <div v-if="request.errors || request.warnings">
      <!-- WEBSOCKET ERRORS COUNT -->
      <span class="count" v-if="request.errors">
        {{ request.errors }}<YIcon iname="bug" class="text-danger ms-1" />
      </span>
      <!-- WEBSOCKET WARNINGS COUNT -->
      <span class="count" v-if="request.warnings">
        {{ request.warnings
        }}<YIcon iname="warning" class="text-warning ms-1" />
      </span>
    </div>

    <!-- VIEW ERROR BUTTON -->
    <BButton
      v-if="showError && request.error"
      size="sm"
      pill
      class="error-btn ms-auto py-0"
      variant="danger"
      @click="reviewError"
    >
      <small v-t="'api_error.view_error'" />
    </BButton>

    <!-- TIME DISPLAY -->
    <time
      v-if="showTime"
      :datetime="hour(request.date)"
      :class="request.error ? 'ms-2' : 'ms-auto'"
    >
      {{ hour(request.date) }}
    </time>
  </div>
</template>

<style lang="scss" scoped>
div {
  display: flex;
  align-items: center;
  font-size: $font-size-sm;
}

.error-btn {
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.status {
  display: inline-block;
  border-radius: 50%;
  width: 0.75rem;
  min-width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.25rem;

  &.lg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
}

time {
  min-width: 3.5rem;
  text-align: right;
}

.count {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
}

@include media-breakpoint-down(sm) {
  .xs-hide .request-desc {
    display: none;
  }
}
</style>
