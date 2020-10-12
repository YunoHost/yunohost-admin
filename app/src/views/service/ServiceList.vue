<template>
  <div class="service-list">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-service" v-model="search" :placeholder="$t('search.service')" />
      </b-input-group>
    </div>

    <b-list-group v-if="filteredServices">
      <b-list-group-item
        v-for="{ name, description, status, last_state_change } in filteredServices"
        :key="name || service"
        :to="{ name: 'service-info', params: { name }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div class="w-100">
          <h5>{{ name }} <small>{{ description }}</small></h5>
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
  </div>
</template>

<script>
import api from '@/api'
import { distanceToNow } from '@/filters/date'

export default {
  name: 'ServiceList',

  data: function () {
    return {
      search: '',
      services: undefined
    }
  },

  computed: {
    filteredServices () {
      if (!this.services) return
      const search = this.search.toLowerCase()
      return this.services.filter(({ name }) => {
        return name.toLowerCase().includes(search)
      })
    }
  },

  filters: {
    distanceToNow
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
