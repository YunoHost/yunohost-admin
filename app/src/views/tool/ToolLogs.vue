<template>
  <search-view
    id="tool-logs"
    :search.sync="search"
    :items="operations"
    :filtered-items="filteredOperations"
    items-name="logs"
  >
    <b-card no-body>
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
  </search-view>
</template>

<script>
import api from '@/api'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import SearchView from '@/components/SearchView'

export default {
  name: 'ServiceList',

  data () {
    return {
      search: '',
      operations: undefined
    }
  },

  computed: {
    filteredOperations () {
      if (!this.operations) return
      const search = this.search.toLowerCase()
      const operations = this.operations.filter(({ description }) => {
        return description.toLowerCase().includes(search)
      })
      return operations.length > 0 ? operations : null
    }
  },

  filters: {
    distanceToNow,
    readableDate
  },

  methods: {
    fetchData () {
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
  },

  components: { SearchView }
}
</script>
