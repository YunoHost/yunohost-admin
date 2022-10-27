<template>
  <div :class="['custom-spinner', spinner]" />
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  name: 'Spinner',

  computed: {
    ...mapGetters(['spinner'])
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
    background-image: url('../../assets/spinners/pacman_dark.gif');
    animation-name: back-and-forth-pacman;

    [dark-theme="true"] & {
      background-image: url('../../assets/spinners/pacman_light.gif');
    }

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

  &.spookycat {
    height: 40px;
    width: 65px;
    background-image: url('../../assets/spinners/spookycat.gif');
    animation-name: back-and-forth-spookycat;

    @keyframes back-and-forth-spookycat {
      0%, 100% { transform: scale(1, 1); margin-left: 0; }
      49% { transform: scale(1, 1); margin-left: calc(100% - 100px);}
      50% { transform: scale(-1, 1); margin-left: calc(100% - 100px);}
      99% { transform: scale(-1, 1); margin-left: 0;}
    }
  }
}
</style>
