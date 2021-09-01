<template>
  <!-- This card receives style from `ViewLockOverlay` if used inside it -->
  <b-card-body>
    <b-card-title class="text-center mt-4" v-t="hasMessages ? 'api.processing' : 'api_waiting'" />

    <!-- PROGRESS BAR -->
    <b-progress
      v-if="progress" class="my-4"
      :max="progress.max" height=".5rem"
    >
      <b-progress-bar variant="success" :value="progress.values[0]" />
      <b-progress-bar variant="warning" :value="progress.values[1]" animated />
      <b-progress-bar variant="secondary" :value="progress.values[2]" striped />
    </b-progress>
    <!-- OR SPINNER -->
    <div v-else class="custom-spinner my-4" :class="spinner" />

    <message-list-group
      v-if="hasMessages" :messages="request.messages"
      bordered fixed-height auto-scroll
    />
  </b-card-body>
</template>

<script>
import { mapGetters } from 'vuex'

import MessageListGroup from '@/components/MessageListGroup'

export default {
  name: 'WaitingDisplay',

  components: {
    MessageListGroup
  },

  props: {
    request: { type: Object, required: true }
  },

  computed: {
    ...mapGetters(['spinner']),

    hasMessages () {
      return this.request.messages && this.request.messages.length > 0
    },

    progress () {
      const progress = this.request.progress
      if (!progress) return null
      return {
        values: progress,
        max: progress.reduce((sum, value) => (sum + value), 0)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-spinner {
  animation: 8s linear infinite;
  background-repeat: no-repeat;

  &.pacman {
    height: 24px;
    width: 24px;
    background-image: url('../../assets/spinners/pacman.gif');
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
    background-image: url('../../assets/spinners/magikarp.gif');
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
    background-image: url('../../assets/spinners/nyancat.gif');
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
