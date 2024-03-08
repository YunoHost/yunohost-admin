<template>
  <ViewSearch
    :search.sync="search"
    :items="operations"
    :filtered-items="filteredOperations"
    items-name="logs"
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardListSkeleton"
  >
    <YCard :title="$t('logs_operation')" icon="wrench" no-body>
      <BListGroup flush>
        <BListGroupItem
          v-for="log in filteredOperations"
          :key="log.name"
          :to="{ name: 'tool-log', params: { name: log.name || log.log_path } }"
          :title="readableDate(log.started_at)"
        >
          <small class="mr-3">{{ distanceToNow(log.started_at) }} </small>
          <YIcon :iname="log.icon" :class="'text-' + log.class" />
          {{ log.description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>
  </ViewSearch>
</template>

<script>
import { distanceToNow, readableDate } from '@/helpers/filters/date'

export default {
  compatConfig: { MODE: 3 },
  name: 'ToolLogs',

  data() {
    return {
      queries: [['GET', `logs?limit=${25}&with_details`]],
      search: '',
      operations: undefined,
    }
  },

  computed: {
    filteredOperations() {
      if (!this.operations) return
      const search = this.search.toLowerCase()
      const operations = this.operations.filter(({ description }) => {
        return description.toLowerCase().includes(search)
      })
      return operations.length ? operations : null
    },
  },

  methods: {
    onQueriesResponse({ operation }) {
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
    },

    distanceToNow,
    readableDate,
  },
}
</script>
