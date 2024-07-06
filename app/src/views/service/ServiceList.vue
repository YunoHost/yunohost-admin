<script setup lang="ts">
import { computed, ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { distanceToNow } from '@/helpers/filters/date'

const { loading } = useInitialQueries([['GET', 'services']], {
  onQueriesResponse,
})
const search = ref('')
const services = ref()

const filteredServices = computed(() => {
  if (!services.value) return
  const services_ = services.value.filter(({ name }) => {
    return name.toLowerCase().includes(search.value.toLowerCase())
  })
  return services_.length ? services_ : null
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
    v-model:search="search"
    :filtered-items="filteredServices"
    :items="services"
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
