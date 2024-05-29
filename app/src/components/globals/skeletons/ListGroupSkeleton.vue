<script setup lang="ts">
import { randint } from '@/helpers/commons'

withDefaults(defineProps<{ itemCount: number }>(), { itemCount: 5 })
</script>

<template>
  <BListGroup>
    <BListGroupItem v-for="count in itemCount" :key="count">
      <BSkeleton :width="randint(15, 25) + '%'" height="24px" class="mb-2" />
      <BSkeleton :width="randint(25, 50) + '%'" height="24px" class="m-0" />
    </BListGroupItem>
  </BListGroup>
</template>
