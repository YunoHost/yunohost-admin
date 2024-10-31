<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import { distanceToNow } from '@/helpers/filters/date'
import type { ServiceList } from '@/types/core/api'

const { t } = useI18n()

const services = await api
  .get<ServiceList>({ uri: 'services' })
  .then((services) => {
    return Object.keys(services)
      .sort()
      .map((name) => {
        const service = services[name]
        return {
          ...service,
          name,
          last_state_change:
            service.last_state_change === 'unknown'
              ? t('unknown')
              : distanceToNow(service.last_state_change, false),
        }
      })
  })

const [search, filteredServices] = useSearch(services, (s, service) => {
  return service.name.toLowerCase().includes(s)
})
</script>

<template>
  <ViewSearch
    id="service-list"
    v-model="search"
    :items="filteredServices"
    items-name="services"
  >
    <BListGroup>
      <YListItem
        v-for="{
          name,
          description,
          status,
          last_state_change,
        } in filteredServices"
        :key="name"
        :to="{ name: 'service-info', params: { name } }"
        :label="name"
        :sublabel="description"
      >
        <span :class="`text-${status === 'running' ? 'success' : 'danger'}`">
          <YIcon :iname="status === 'running' ? 'check-circle' : 'times'" />
          {{ $t(status) }}
        </span>
        {{ $t('since') }} {{ last_state_change }}
      </YListItem>
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
