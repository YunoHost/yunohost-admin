<script setup lang="ts">
import { ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { useSearch } from '@/composables/useSearch'
import { distanceToNow } from '@/helpers/filters/date'
import type { Obj } from '@/types/commons'

const { loading } = useInitialQueries([{ uri: 'services' }], {
  onQueriesResponse,
})

const services = ref<Obj[] | undefined>()
const [search, filteredServices] = useSearch(services, (s, service) => {
  return service.name.toLowerCase().includes(s)
})

function onQueriesResponse(services_: any) {
  services.value = Object.keys(services_)
    .sort()
    .map((name) => {
      const service = services_[name]
      if (service.last_state_change === 'unknown') {
        service.last_state_change = 0
      }
      return { ...service, name }
    })
}
</script>

<template>
  <ViewSearch
    id="service-list"
    v-model="search"
    :items="filteredServices"
    items-name="services"
    :loading="loading"
  >
    <BListGroup>
      <BListGroupItem
        v-for="{
          name,
          description,
          status,
          last_state_change,
        } in filteredServices"
        :key="name"
        :to="{ name: 'service-info', params: { name } }"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <div>
          <h5 class="fw-bold">
            {{ name }}
            <small class="text-secondary">{{ description }}</small>
          </h5>
          <p class="m-0">
            <span
              :class="status === 'running' ? 'text-success' : 'text-danger'"
            >
              <YIcon :iname="status === 'running' ? 'check-circle' : 'times'" />
              {{ $t(status) }}
            </span>
            {{ $t('since') }} {{ distanceToNow(last_state_change) }}
          </p>
        </div>

        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </ViewSearch>
</template>

<style lang="scss" scoped>
@include media-breakpoint-down(lg) {
  h5 small {
    display: block;
    margin-top: 0.25rem;
  }
}
</style>
