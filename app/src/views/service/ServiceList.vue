<template>
  <search-view
    id="service-list"
    :search.sync="search"
    :items="services"
    :filtered-items="filteredServices"
    items-name="services"
  >
    <b-list-group v-if="filteredServices">
      <b-list-group-item
        v-for="{ name, description, status, last_state_change } in filteredServices"
        :key="name || service"
        :to="{ name: 'service-info', params: { name }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div class="w-100">
          <h5 class="font-weight-bold">
            {{ name }}
            <small class="text-secondary">{{ description }}</small>
          </h5>
          <p class="mb-0">
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
  </search-view>
</template>

<script>
import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'
import SearchView from '@/components/SearchView'

export default {
  name: 'ServiceList',

  data () {
    return {
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
      return services.length > 0 ? services : null
    }
  },

  methods: {
    fetchData () {
      // simply use the api helper since we will not store the request's result.
      api.get('services').then(servicesData => {
        this.services = Object.keys(servicesData).sort().map(name => {
          const service = servicesData[name]
          if (service.last_state_change === 'unknown') {
            service.last_state_change = 0
          }
          return { ...service, name }
        })
      })
    }
  },

  created () {
    this.fetchData()
  },

  components: { SearchView },

  filters: {
    distanceToNow
  }
}
</script>

<style lang="scss" scoped>
@include media-breakpoint-down(sm) {
   h5 small {
     display: block;
   }
}
</style>
