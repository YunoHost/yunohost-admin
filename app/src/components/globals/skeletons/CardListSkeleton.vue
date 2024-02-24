<template>
  <BCard no-body>
    <template #header>
      <BSkeleton width="30%" height="36px" class="m-0" />
    </template>

    <BListGroup flush>
      <BListGroupItem v-for="count in itemCount" :key="count" class="d-flex">
        <div style="width: 20%">
          <BSkeleton
            :width="randint(50, 100) + '%'"
            height="24px"
            class="mr-3"
          />
        </div>
        <BSkeleton :width="randint(30, 80) + '%'" height="24px" class="m-0" />
      </BListGroupItem>
    </BListGroup>
  </BCard>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardListSkeleton',

  props: {
    itemCount: { type: Number, default: 5 },
  },

  methods: { randint },
}
</script>
