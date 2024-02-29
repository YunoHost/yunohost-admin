<template>
  <div class="query-header w-100" v-on="$listeners" v-bind="$attrs">
    <!-- STATUS -->
    <span class="status" :class="['bg-' + color, statusSize]" :aria-label="$t('api.query_status.' + request.status)" />

    <!-- REQUEST DESCRIPTION -->
    <strong class="request-desc">
      {{ request.humanRoute || request.operationId }}
    </strong>

    <div v-if="request.errors || request.warnings">
      <!-- WEBSOCKET ERRORS COUNT -->
      <span class="count" v-if="request.errors">
        {{ request.errors }}<icon iname="bug" class="text-danger ml-1" />
      </span>
      <!-- WEBSOCKET WARNINGS COUNT -->
      <span class="count" v-if="request.warnings">
        {{ request.warnings }}<icon iname="warning" class="text-warning ml-1" />
      </span>
    </div>

    <!-- VIEW ERROR BUTTON -->
    <b-button
      v-if="showError && request.error"
      size="sm" pill
      class="error-btn ml-auto py-0"
      variant="danger"
      @click="reviewError"
    >
      <small v-t="'api_error.view_error'" />
    </b-button>

    <!-- TIME DISPLAY -->
    <time v-if="showTime" :datetime="request.date | hour" :class="request.error ? 'ml-2' : 'ml-auto'">
      {{ request.date | hour }}
    </time>
  </div>
</template>

<script>
export default {
  name: 'QueryHeader',

  props: {
    request: { type: Object, required: true },
    statusSize: { type: String, default: '' },
    showTime: { type: Boolean, default: false },
    showError: { type: Boolean, default: false }
  },

  computed: {
    color () {
      const statuses = {
        pending: 'primary',
        success: 'success',
        warning: 'warning',
        error: 'danger'
      }
      return statuses[this.request.status]
    },

    errorsCount () {
      return this.request.messages.filter(({ type }) => type === 'danger').length
    },

    warningsCount () {
      return this.request.messages.filter(({ type }) => type === 'warning').length
    }
  },

  methods: {
    reviewError () {
      this.$store.dispatch('REVIEW_ERROR', this.request)
    }
  },

  filters: {
    readableUri (uri) {
      return uri.split('?')[0].split('/').join(' > ') // replace('/', ' > ')
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
  justify-content: center;
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

time {
  min-width: 3.5rem;
  text-align: right;
}

.count {
  display: flex;
  align-items: center;
  margin-left: .5rem;
}

@include media-breakpoint-down(xs) {
  .xs-hide .request-desc {
    display: none;
  }
}

</style>
