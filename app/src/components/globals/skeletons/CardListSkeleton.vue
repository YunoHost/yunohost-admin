<script setup lang="ts">
import { randint } from '@/helpers/commons'

withDefaults(defineProps<{ itemCount?: number; search?: boolean }>(), {
  itemCount: 5,
  search: false,
})
</script>

<template>
  <BSkeletonWrapper :search="search">
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
              class="me-3"
            />
          </div>
          <BSkeleton :width="randint(30, 80) + '%'" height="24px" class="m-0" />
        </BListGroupItem>
      </BListGroup>
    </BCard>
  </BSkeletonWrapper>
</template>
