<template>
  <b-card>
    <template #header>
      <b-skeleton width="30%" height="36px" class="m-0" />
    </template>

    <template v-for="count in itemCount">
      <b-row :key="count" :class="{ 'd-block': cols === null }">
        <b-col v-bind="cols">
          <div style="height: 38px" class="d-flex align-items-center">
            <b-skeleton class="m-0" :width="randint(45, 100) + '%'" height="24px" />
          </div>
        </b-col>

        <b-col>
          <div class="w100 d-flex justify-content-between" v-if="count % 2 === 0">
            <b-skeleton width="100%" height="38px" />

            <b-skeleton width="38px" height="38px" class="ml-2" />
          </div>

          <b-skeleton v-else width="100%" height="38px" />

          <b-skeleton :width="randint(15, 35) + '%'" height="19px" />
        </b-col>
      </b-row>

      <hr :key="count + '-hr'">
    </template>

    <template #footer>
      <div class="d-flex justify-content-end w-100">
        <b-skeleton width="100px" height="38px" />
      </div>
    </template>
  </b-card>
</template>

<script>
import { randint } from '@/helpers/commons'

export default {
  name: 'CardFormSkeleton',

  props: {
    itemCount: { type: Number, default: 5 },
    cols: { type: [Object, null], default () { return { md: 4, lg: 2 } } }
  },

  methods: { randint }
}
</script>
