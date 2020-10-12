<template>
  <b-overlay
    variant="white" rounded="sm" opacity="0.5"
    no-center
    :show="waiting"
  >
    <slot name="default" />

    <template v-slot:overlay>
      <b-card no-body>
        <div class="d-flex justify-content-center">
          <!-- <b-spinner /> -->
          <img class="pacman" src="@/assets/ajax-loader.gif">
        </div>
        <b-card-body class="pb-4">
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

        <!-- MESSAGES -->
        <b-list-group v-if="messages" flush>
          <b-list-group-item
            v-for="({ text, type }, i) in messages" :key="i"
            :variant="type"
          >
            {{ text }}
          </b-list-group-item>
        </b-list-group>
      </b-card>
    </template>
  </b-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ApiWaitOverlay',

  computed: {
    ...mapGetters(['waiting', 'lastAction']),

    progress () {
      const progress = this.lastAction.progress
      if (!progress) return null
      return {
        values: progress, max: progress.reduce((sum, value) => (sum + value), 0)
      }
    },

    messages () {
      const messages = this.lastAction.messages
      return messages.length > 0 ? this.lastAction.messages : null
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  position: sticky;
  top: 5vh;
  margin: 0 5%;
  padding: 3rem 0;

  @include media-breakpoint-up(md) {
    margin: 0 10%;
  }
  @include media-breakpoint-up(lg) {
    margin: 0 20%;
  }
}

.card-body {
  padding-bottom: 2rem;
}

.progress {
  margin-top: 2rem;
}

.list-group {
  max-height: 50vh;
  overflow-y: auto;

  // Hide all message except the last one if the mouse isn't hovering the list group.
  &:not(:hover) .list-group-item:not(:last-of-type) {
    display: none;
  }
}

.pacman {
  animation: back-and-forth 4s linear infinite;

  @keyframes back-and-forth {
    0%, 100% { transform: translateX(-50vw) scale(1); }
    49% { transform: translateX(50vw) scale(1); }
    50% { transform: translateX(50vw) scale(-1); }
    99% { transform: translateX(-50vw) scale(-1); }
  }
}
</style>
