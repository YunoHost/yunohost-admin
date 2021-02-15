<template>
  <div class="query-header w-100" v-on="$listeners" v-bind="$attrs">
    <!-- STATUS -->
    <span class="status" :class="['bg-' + color, statusSize]" :aria-label="$t('api.query_status.' + action.status)" />

    <!-- ACTION DESCRIPTION -->
    <strong class="action-desc">
      {{ action.uri | readableUri }}
      <small>({{ $t('history.methods.' + action.method) }})</small>
    </strong>

    <div>
      <!-- WEBSOCKET ERRORS COUNT -->
      <span class="count" v-if="errorsCount">
        {{ errorsCount }}<icon iname="bug" class="text-danger ml-1" />
      </span>
      <!-- WEBSOCKET WARNINGS COUNT -->
      <span class="count" v-if="warningsCount">
        {{ warningsCount }}<icon iname="warning" class="text-warning ml-1" />
      </span>
    </div>

    <!-- VIEW ERRO BUTTON -->
    <b-button
      v-if="showError && action.status === 'error'"
      size="sm" pill
      class="error-btn ml-auto py-0"
      variant="danger"
    >
      <small v-t="'api_error.view_error'" />
    </b-button>

    <!-- TIME DISPLAY -->
    <time v-if="showTime" :datetime="action.date | hour" :class="!showError || action.status !== 'error' ? 'ml-auto' : 'ml-2'">
      {{ action.date | hour }}
    </time>
  </div>
</template>

<script>
export default {
  name: 'QueryHeader',

  props: {
    action: { type: Object, required: true },
    statusSize: { type: String, default: '' },
    showTime: { type: Boolean, default: false },
    showError: { type: Boolean, default: false },
    truncate: { type: Boolean, default: true }
  },

  computed: {
    color () {
      const statuses = {
        pending: 'primary',
        success: 'success',
        warning: 'warning',
        error: 'danger'
      }
      return statuses[this.action.status]
    },

    errorsCount () {
      return this.action.messages.filter(({ type }) => type === 'danger').length
    },

    warningsCount () {
      return this.action.messages.filter(({ type }) => type === 'warning').length
    }
  },

  filters: {
    readableUri (uri) {
      return uri.split('?')[0].replace('/', ' > ')
    },

    hour (date) {
      return new Date(date).toLocaleTimeString()
    }
  }
}
</script>

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
  min-width: 70px;
}

.status {
  display: inline-block;
  border-radius: 50%;
  width: .75rem;
  min-width: .75rem;
  height: .75rem;
  margin-right: .25rem;

  &.lg {
    width: 1rem;
    height: 1rem;
    margin-right: .5rem;
  }
}

.count {
  display: flex;
  align-items: center;
  margin-left: .5rem;
}

@include media-breakpoint-down(xs) {
  .xs-hide .action-desc {
    display: none;
  }
}

</style>
