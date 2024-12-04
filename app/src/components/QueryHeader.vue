<script setup lang="ts">
import { computed, toRefs } from 'vue'

import type { APIRequest } from '@/composables/useRequests'
import { STATUS_VARIANT } from '@/helpers/yunohostArguments'

const props = defineProps<{
  request: APIRequest
  type: 'overlay' | 'history'
}>()

const emit = defineEmits<{ showError: [id: string] }>()

const statusVariant = computed(() => STATUS_VARIANT[props.request.status])
const { errors, warnings } = toRefs(
  props.request.action || { errors: 0, warnings: 0 },
)
const hour = computed(() => {
  return new Date(props.request.date).toLocaleTimeString()
})
</script>

<template>
  <div class="query-header d-flex align-items-center w-100">
    <span
      class="status"
      :class="[`bg-${statusVariant}`, type]"
      :aria-label="$t(`api.query_status.${request.status}`)"
    />

    <!-- tabindex 0 on title for focus-trap when no tabable elements -->
    <strong :tabindex="type === 'overlay' ? 0 : undefined">
      {{ request.title }}
    </strong>

    <div v-if="errors || warnings">
      <span v-if="errors" class="ms-2">
        {{ errors }}<YIcon iname="bug" class="text-danger ms-1" />
      </span>
      <span v-if="warnings" class="ms-2">
        {{ warnings }}<YIcon iname="warning" class="text-warning ms-1" />
      </span>
    </div>

    <template v-if="type === 'history'">
      <BButton
        v-if="request.err"
        size="sm"
        pill
        class="error-btn ms-auto py-0"
        variant="danger"
        @click.stop="emit('showError', request.id)"
      >
        <small v-t="'api_error.view_error'" />
      </BButton>

      <time :datetime="hour" :class="request.err ? 'ms-2' : 'ms-auto'">
        {{ hour }}
      </time>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.query-header {
  font-size: $font-size-sm;
}

.status {
  display: inline-block;
  border-radius: 50%;

  &.history {
    width: 0.75rem;
    height: 0.75rem;
    margin-right: 0.5rem;
  }

  &.overlay {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
  }
}

.error-btn {
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

time {
  min-width: 3rem;
  text-align: right;
}
</style>
