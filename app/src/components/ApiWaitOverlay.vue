<template>
  <b-overlay
    variant="white" rounded="sm" opacity="0.5"
    no-center
    :show="waiting"
  >
    <slot name="default" />

    <template v-slot:overlay>
      <b-card no-body>
        <div v-if="!error" class="mt-3 px-3">
          <div class="custom-spinner" :class="spinner" />
        </div>

        <b-card-body v-if="error">
          <error-page />
        </b-card-body>

        <b-card-body v-else class="pb-4">
          <b-card-title class="text-center m-0" v-t="'api_waiting'" />

          <!-- PROGRESS BAR -->
          <b-progress
            v-if="progress" class="mt-4"
            :max="progress.max" height=".5rem"
          >
            <b-progress-bar variant="success" :value="progress.values[0]" />
            <b-progress-bar variant="warning" :value="progress.values[1]" animated />
            <b-progress-bar variant="secondary" :value="progress.values[2]" striped />
          </b-progress>
        </b-card-body>

        <b-card-footer v-if="error" class="justify-content-end">
          <b-button variant="primary" v-t="'ok'" @click="$store.dispatch('SERVER_RESPONDED', true)" />
        </b-card-footer>
      </b-card>
    </template>
  </b-overlay>
</template>

<script>
import { mapGetters } from 'vuex'
import ErrorPage from '@/views/ErrorPage'

export default {
  name: 'ApiWaitOverlay',

  computed: {
    ...mapGetters(['waiting', 'lastAction', 'error', 'spinner']),

    progress () {
      if (!this.lastAction) return null
      const progress = this.lastAction.progress
      if (!progress) return null
      return {
        values: progress, max: progress.reduce((sum, value) => (sum + value), 0)
      }
    }
  },

  components: {
    ErrorPage
  }
}
</script>

<style lang="scss" scoped>
.card {
  position: sticky;
  top: 5vh;
  margin: 0 5%;

  @include media-breakpoint-up(md) {
    margin: 0 10%;
  }
  @include media-breakpoint-up(lg) {
    margin: 0 20%;
  }
}

.card-body {
  padding-bottom: 2rem;
  max-height: 50vh;
  overflow-y: auto;
}

.progress {
  margin-top: 2rem;
}

.custom-spinner {
  animation: 4s linear infinite;
  background-repeat: no-repeat;

  &.pacman {
    height: 24px;
    width: 24px;
    background-image: url('../assets/spinners/pacman.gif');
    animation-name: back-and-forth-pacman;

    @keyframes back-and-forth-pacman {
      0%, 100% { transform: scale(1); margin-left: 0; }
      49% { transform: scale(1); margin-left: calc(100% - 24px);}
      50% { transform: scale(-1); margin-left: calc(100% - 24px);}
      99% { transform: scale(-1); margin-left: 0;}
    }
  }

  &.magikarp {
    height: 32px;
    width: 32px;
    background-image: url('../assets/spinners/magikarp.gif');
    animation-name: back-and-forth-magikarp;

    @keyframes back-and-forth-magikarp {
      0%, 100% { transform: scale(1, 1); margin-left: 0; }
      49% { transform: scale(1, 1); margin-left: calc(100% - 32px);}
      50% { transform: scale(-1, 1); margin-left: calc(100% - 32px);}
      99% { transform: scale(-1, 1); margin-left: 0;}
    }
  }

  &.nyancat {
    height: 40px;
    width: 100px;
    background-image: url('../assets/spinners/nyancat.gif');
    animation-name: back-and-forth-nyancat;

    @keyframes back-and-forth-nyancat {
      0%, 100% { transform: scale(1, 1); margin-left: 0; }
      49% { transform: scale(1, 1); margin-left: calc(100% - 100px);}
      50% { transform: scale(-1, 1); margin-left: calc(100% - 100px);}
      99% { transform: scale(-1, 1); margin-left: 0;}
    }
  }
}
</style>
