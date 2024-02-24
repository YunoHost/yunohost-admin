<template>
  <BCard>
    <template #header>
      <BSkeleton width="30%" height="36px" class="m-0" />
    </template>

    <div v-for="count in itemCount" :key="count">
      <template v-if="randint(0, 1)">
        <BSkeleton width="100%" height="24px" />
        <BSkeleton :width="randint(15, 60) + '%'" height="24px" />
      </template>
      <BSkeleton v-else :width="randint(45, 100) + '%'" height="24px" />

      <BSkeleton :width="randint(20, 30) + '%'" height="38px" class="mt-3" />
      <hr>
    </div>
  </BCard>
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
