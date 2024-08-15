<script setup lang="ts">
import { randint } from '@/helpers/commons'

withDefaults(
  defineProps<{ itemCount: number; button: boolean; search: boolean }>(),
  { itemCount: 5, button: true, search: true },
)
</script>

<template>
  <BSkeletonWrapper :button="button" :search="search">
    <BListGroup>
      <BListGroupItem v-for="count in itemCount" :key="count">
        <BSkeleton :width="randint(15, 25) + '%'" height="24px" class="mb-2" />
        <BSkeleton :width="randint(25, 50) + '%'" height="24px" class="m-0" />
      </BListGroupItem>
    </BListGroup>
  </BSkeletonWrapper>
</template>
