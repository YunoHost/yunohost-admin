<template>
  <view-search
    id="service-list"
    :search.sync="search"
    :items="services"
    :filtered-items="filteredServices"
    items-name="services"
    :queries="queries"
    @queries-response="formatServices"
  >
    <b-list-group>
      <b-list-group-item
        v-for="{ name, description, status, last_state_change } in filteredServices" :key="name"
        :to="{ name: 'service-info', params: { name }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ name }}
            <small class="text-secondary">{{ description }}</small>
          </h5>
          <p class="m-0">
            <span :class="status === 'running' ? 'text-success' : 'text-danger'">
              <icon :iname="status === 'running' ? 'check-circle' : 'times'" />
              {{ $t(status) }}
            </span>
            {{ $t('since') }} {{ last_state_change | distanceToNow }}
          </p>
        </div>

        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </view-search>
</template>

<script>
import { distanceToNow } from '@/helpers/filters/date'

export default {
  name: 'ServiceList',

  data () {
    return {
      queries: ['services'],
      search: '',
      services: undefined
    }
  },

  computed: {
    filteredServices () {
      if (!this.services) return
      const search = this.search.toLowerCase()
      const services = this.services.filter(({ name }) => {
        return name.toLowerCase().includes(search)
      })
      return services.length ? services : null
    }
  },

  methods: {
    formatServices (services) {
      this.services = Object.keys(services).sort().map(name => {
        const service = services[name]
        if (service.last_state_change === 'unknown') {
          service.last_state_change = 0
        }
        return { ...service, name }
      })
    }
  },

  filters: { distanceToNow }
}
</script>

<style lang="scss" scoped>
@include media-breakpoint-down(md) {
   h5 small {
     display: block;
     margin-top: .25rem;
   }
}
</style>
