<script setup lang="ts">
import { useSettings } from '@/composables/useSettings'

const { spinner } = useSettings()
</script>

<template>
  <div :class="['custom-spinner', spinner]">
    <img alt="Spinner" />
  </div>
</template>

<style lang="scss" scoped>
.custom-spinner {
  animation: 4s linear 0s infinite alternate move;
  @keyframes move {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  img {
    animation: 8s steps(1) infinite turn;
    @keyframes turn {
      0% {
        transform: rotateY(0);
      }
      50%, 100% {
        transform: rotateY(180deg);
      }
    }
  }

  &.pacman {
    width: calc(100% - 24px);
    img {
      height: 24px;
      width: 24px;
      content: url("../../assets/spinners/pacman_dark.gif");

      [data-bs-theme='dark'] & {
        content: url('../../assets/spinners/pacman_light.gif');
      }
    }
  }

  &.magikarp {
    width: calc(100% - 32px);
    img {
      height: 32px;
      width: 32px;
      content: url("../../assets/spinners/magikarp.gif");
    }
  }

  &.nyancat {
    width: calc(100% - 100px);
    img {
      height: 40px;
      width: 100px;
      content: url("../../assets/spinners/nyancat.gif");
    }
  }

  &.spookycat {
    width: calc(100% - 65px);
    img {
      height: 40px;
      width: 65px;
      content: url("../../assets/spinners/spookycat.gif");
    }
  }

  &.transcat {
    width: calc(100% - 100px);
    img {
      height: 40px;
      width: 100px;
      content: url("../../assets/spinners/transcat.gif");
    }
  }
}
</style>
