<template>
  <b-overlay
    variant="white" opacity="0.75"
    no-center
    :show="waiting || error !== null"
  >
    <slot name="default" />

    <template v-slot:overlay>
      <b-card no-body class="card-overlay" v-if="lastAction">
        <b-card-header header-bg-variant="white">
          <query-header :action="lastAction" status-size="lg" />
        </b-card-header>

        <component :is="error ? 'ErrorDisplay' : 'WaitingDisplay'" :action="lastAction" />
      </b-card>
    </template>
  </b-overlay>
</template>

<script>
import { mapGetters } from 'vuex'
import { ErrorDisplay, WaitingDisplay } from '@/views/_partials'
import QueryHeader from '@/components/QueryHeader'

export default {
  name: 'ViewLockOverlay',

  computed: mapGetters(['waiting', 'error', 'lastAction']),

  components: {
    ErrorDisplay,
    WaitingDisplay,
    QueryHeader
  }
}
</script>

<style lang="scss" scoped>
// Style for `ErrorDisplay` and `WaitingDisplay`'s cards
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
      max-height: 60vh;
      overflow-y: auto;
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
