<template>
  <view-search
    :search.sync="search"
    :items="operations"
    :filtered-items="filteredOperations"
    items-name="logs"
    :queries="queries"
    @queries-response="formatLogsData"
    skeleton="card-list-skeleton"
  >
    <card :title="$t('logs_operation')" icon="wrench" no-body>
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
    </card>
  </view-search>
</template>

<script>
import { distanceToNow, readableDate } from '@/helpers/filters/date'

export default {
  name: 'ToolLogs',

  data () {
    return {
      queries: [`logs?limit=${25}&with_details`],
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
      return operations.length ? operations : null
    }
  },

  methods: {
    formatLogsData ({ operation }) {
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
    }
  },

  filters: {
    distanceToNow,
    readableDate
  }
}
</script>
