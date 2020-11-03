<template>
  <div class="tool-logs">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-logs" v-model="search" :placeholder="$t('search.logs')" />
      </b-input-group>
    </div>

    <b-card no-body v-if="operations">
      <template v-slot:header>
        <h2><icon iname="wrench" /> {{ $t('logs_operation') }}</h2>
      </template>
      <b-list-group flush>
        <b-list-group-item
          v-for="log in filteredOperations" :key="log.name"
          :to="{ name: 'tool-log', params: { name: log.name || log.log_path } }"
          :title="log.started_at | readableDate"
        >
          <small class="mr-3">{{ log.started_at | distanceToNow }} </small>
          <icon :iname="log.icon" :class="'text-' + log.class" />
          {{ log.description }}
        </b-list-group-item>
      </b-list-group>
    </b-card>
  </div>
</template>

<script>
import api from '@/api'
import { distanceToNow, readableDate } from '@/helpers/filters/date'

export default {
  name: 'ServiceList',

  data: function () {
    return {
      search: '',
      operations: undefined
    }
  },

  computed: {
    filteredOperations () {
      if (!this.operations) return
      const search = this.search.toLowerCase()
      return this.operations.filter(({ description }) => {
        return description.toLowerCase().includes(search)
      })
    }
  },

  filters: {
    distanceToNow,
    readableDate
  },

  methods: {
    fetchData () {
      // FIXME only prints operation for now (can't receive 'history', 'app', 'service', etc.)
      api.get(`logs?limit=${25}&with_details`).then(({ operation }) => {
        operation.forEach((log, index) => {
          if (log.success === '?') {
            operation[index].icon = 'question'
            operation[index].class = 'warning'
          } else if (log.success) {
            operation[index].icon = 'check'
            operation[index].class = 'success'
          } else {
            operation[index].icon = 'close'
            operation[index].class = 'danger'
          }
        })
        this.operations = operation
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
</style>
