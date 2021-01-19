<template>
  <b-card no-body>
    <template #header>
      <b-skeleton width="30%" height="36px" class="m-0" />
    </template>

    <b-list-group flush>
      <b-list-group-item v-for="count in itemCount" :key="count" class="d-flex">
        <div style="width: 20%;">
          <b-skeleton :width="randint(50, 100) + '%'" height="24px" class="mr-3" />
        </div>
        <b-skeleton :width="randint(30, 80) + '%'" height="24px" class="m-0" />
      </b-list-group-item>
    </b-list-group>
  </b-card>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardListSkeleton',

  props: {
    itemCount: { type: Number, default: 5 }
  },

  methods: { randint }
}
</script>
