<template>
  <b-list-group>
    <b-list-group-item v-for="count in itemCount" :key="count">
      <b-skeleton :width="randint(15, 25) + '%'" height="24px" class="mb-2" />
      <b-skeleton :width="randint(25, 50) + '%'" height="24px" class="m-0" />
    </b-list-group-item>
  </b-list-group>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'ListGroupSkeleton',

  props: {
    itemCount: { type: Number, default: 5 }
  },

  methods: { randint }
}
</script>
