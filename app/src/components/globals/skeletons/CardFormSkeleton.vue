<template>
  <BCard>
    <template #header>
      <BSkeleton width="30%" height="36px" class="m-0" />
    </template>

    <template v-for="count in itemCount" :key="count">
      <BRow :class="{ 'd-block': cols === null }">
        <BCol v-bind="cols">
          <div style="height: 38px" class="d-flex align-items-center">
            <BSkeleton
              class="m-0"
              :width="randint(45, 100) + '%'"
              height="24px"
            />
          </div>
        </BCol>

        <BCol>
          <div
            class="w100 d-flex justify-content-between"
            v-if="count % 2 === 0"
          >
            <BSkeleton width="100%" height="38px" />

            <BSkeleton width="38px" height="38px" class="ml-2" />
          </div>

          <BSkeleton v-else width="100%" height="38px" />

          <BSkeleton :width="randint(15, 35) + '%'" height="19px" />
        </BCol>
      </BRow>

      <hr />
    </template>

    <template #footer>
      <div class="d-flex justify-content-end w-100">
        <BSkeleton width="100px" height="38px" />
      </div>
    </template>
  </BCard>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardFormSkeleton',

  props: {
    itemCount: { type: Number, default: 5 },
    cols: {
      type: [Object, null],
      default() {
        return { md: 4, lg: 2 }
      },
    },
  },

  methods: { randint },
}
</script>
