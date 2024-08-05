<script setup lang="ts">
import { ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { useSearch } from '@/composables/useSearch'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import type { Obj } from '@/types/commons'

const { loading } = useInitialQueries(
  [{ uri: `logs?limit=${25}&with_details` }],
  { onQueriesResponse },
)

const operations = ref<Obj[] | undefined>()
const [search, filteredOperations] = useSearch(operations, (s, op) => {
  return op.description.toLowerCase().includes(s)
})

function onQueriesResponse({ operation }: any) {
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
  operations.value = operation
}
</script>

<template>
  <ViewSearch
    v-model="search"
    :items="filteredOperations"
    items-name="logs"
    :loading="loading"
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
          <small class="me-3">{{ distanceToNow(log.started_at) }} </small>
          <YIcon :iname="log.icon" :class="'text-' + log.class" />
          {{ log.description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>
  </ViewSearch>
</template>
