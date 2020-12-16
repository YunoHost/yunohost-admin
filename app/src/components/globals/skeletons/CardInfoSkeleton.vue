<template>
  <b-card>
    <template #header>
      <b-skeleton width="30%" height="36px" class="m-0" />
    </template>

    <b-row v-for="i in itemCount" :key="i" no-gutters>
      <b-col cols="5" md="3" xl="3">
        <b-skeleton :width="randint(45, 95) + '%'" height="19px" />
      </b-col>
      <b-col>
        <b-skeleton :width="randint(10, 60) + '%'" height="19px" />
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardInfoSkeleton',

  props: {
    itemCount: { type: Number, default: 5 }
  },

  methods: { randint }
}
</script>
