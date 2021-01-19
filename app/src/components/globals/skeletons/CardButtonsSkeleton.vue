<template>
  <b-card>
    <template #header>
      <b-skeleton width="30%" height="36px" class="m-0" />
    </template>

    <div v-for="count in itemCount" :key="count">
      <template v-if="randint(0, 1)">
        <b-skeleton width="100%" height="24px" />
        <b-skeleton :width="randint(15, 60) + '%'" height="24px" />
      </template>
      <b-skeleton v-else :width="randint(45, 100) + '%'" height="24px" />

      <b-skeleton :width="randint(20, 30) + '%'" height="38px" class="mt-3" />
      <hr>
    </div>
  </b-card>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardButtonsSkeleton',

  props: {
    itemCount: { type: Number, default: 5 }
  },

  methods: { randint }
}
</script>
