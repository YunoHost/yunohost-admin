<script setup lang="ts">
import { randint } from '@/helpers/commons'

withDefaults(defineProps<{ itemCount?: number }>(), { itemCount: 5 })
</script>

<template>
  <BSkeletonWrapper>
    <BCard>
      <template #header>
        <BSkeleton width="30%" height="36px" class="m-0" />
      </template>

      <BRow v-for="i in itemCount" :key="i" no-gutters>
        <BCol cols="5" md="3" xl="3">
          <BSkeleton :width="randint(45, 95) + '%'" height="19px" />
        </BCol>
        <BCol>
          <BSkeleton :width="randint(10, 60) + '%'" height="19px" />
        </BCol>
      </BRow>
    </BCard>
  </BSkeletonWrapper>
</template>
