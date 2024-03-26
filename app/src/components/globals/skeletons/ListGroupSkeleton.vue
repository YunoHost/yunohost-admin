<template>
  <BListGroup>
    <BListGroupItem v-for="count in itemCount" :key="count">
      <BSkeleton :width="randint(15, 25) + '%'" height="24px" class="mb-2" />
      <BSkeleton :width="randint(25, 50) + '%'" height="24px" class="m-0" />
    </BListGroupItem>
  </BListGroup>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  compatConfig: { MODE: 3 },
  name: 'ListGroupSkeleton',

  props: {
    itemCount: { type: Number, default: 5 },
  },

  methods: { randint },
}
</script>
