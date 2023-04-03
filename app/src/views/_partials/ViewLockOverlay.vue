<template>
  <b-overlay
    variant="white" opacity="0.75"
    no-center
    :show="waiting || reconnecting || error !== null"
  >
    <slot name="default" />

    <template #overlay>
      <b-card no-body class="card-overlay">
        <b-card-header header-bg-variant="white">
          <query-header :request="error || currentRequest" status-size="lg" />
        </b-card-header>

        <component :is="component.name" :request="component.request" />
      </b-card>
    </template>
  </b-overlay>
</template>

<script>
import { mapGetters } from 'vuex'
import { ErrorDisplay, WarningDisplay, WaitingDisplay, ReconnectingDisplay } from '@/views/_partials'
import QueryHeader from '@/components/QueryHeader.vue'

export default {
  name: 'ViewLockOverlay',

  components: {
    ErrorDisplay,
    WarningDisplay,
    WaitingDisplay,
    ReconnectingDisplay,
    QueryHeader
  },

  computed: {
    ...mapGetters(['waiting', 'reconnecting', 'error', 'currentRequest']),

    component () {
      const { error, reconnecting, currentRequest: request } = this

      if (error) {
        return { name: 'ErrorDisplay', request: error }
      } else if (request.showWarningMessage) {
        return { name: 'WarningDisplay', request }
      } else if (reconnecting) {
        return { name: 'ReconnectingDisplay' }
      } else {
        return { name: 'WaitingDisplay', request }
      }
    }
  }
}
</script>

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

  ::v-deep {
    .card-body {
      padding: 1.5rem;
      padding-bottom: 0;
      max-height: 60vh;
      overflow-y: auto;

      & > :last-child {
        margin-bottom: 1.5rem;
      }
    }

    .card-footer {
      padding: .5rem .75rem;
      display: flex;
      justify-content: flex-end;
    }
  }

  .card-header {
    padding: .5rem .75rem;
  }
}
</style>
