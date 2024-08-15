<script setup lang="ts">
import { randint } from '@/helpers/commons'
</script>

<template>
  <BSkeletonWrapper button search>
    <BInputGroup class="w-100 mb-4">
      <BInputGroupText>
        <YIcon iname="search" />
      </BInputGroupText>

      <BFormInput :disabled="true" />
    </BInputGroup>

    <BCardGroup deck>
      <BCard v-for="i in 15" :key="i" no-body>
        <div class="d-flex w-100 mt-auto">
          <BSkeleton width="30px" height="30px" class="me-2 ms-auto" />
          <BSkeleton
            :width="randint(30, 70) + '%'"
            height="30px"
            class="me-auto"
          />
        </div>
        <BSkeleton
          v-if="randint(0, 1)"
          :width="randint(30, 85) + '%'"
          height="24px"
          class="mx-auto"
        />
        <BSkeleton
          :width="randint(30, 85) + '%'"
          height="24px"
          class="mx-auto mb-auto"
        />
      </BCard>
    </BCardGroup>
  </BSkeletonWrapper>
</template>

<style lang="scss" scoped>
.card {
  min-height: 10rem;
  flex-basis: 100% !important;

  @include media-breakpoint-up(md) {
    flex-basis: 50% !important;
    max-width: calc(50% - 0.75rem);
  }

  @include media-breakpoint-up(lg) {
    flex-basis: 33% !important;
    max-width: calc(33.3% - 1rem);
  }
}
</style>
