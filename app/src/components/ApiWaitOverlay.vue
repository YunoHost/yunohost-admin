<template>
  <b-overlay
    variant="white" rounded="sm" opacity="0.5"
    no-center
    :show="waiting"
  >

    <slot name="default" />

    <template v-slot:overlay>
      <b-card>
        <div class="d-flex justify-content-center m-3">
          <b-spinner />
        </div>
        <b-card-title class="text-center" v-t="'api_waiting'" />
      </b-card>
    </template>
  </b-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ApiWaitOverlay',

  computed: {
    ...mapGetters(['waiting'])
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
</style>
