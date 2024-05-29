<script setup lang="ts">
import { computed, ref } from 'vue'

import { distanceToNow, readableDate } from '@/helpers/filters/date'

const queries = [['GET', `logs?limit=${25}&with_details`]]
const search = ref('')
const operations = ref()

const filteredOperations = computed(() => {
  if (!operations.value) return
  const search_ = search.value.toLowerCase()
  const operations_ = operations.value.filter(({ description }) => {
    return description.toLowerCase().includes(search_)
  })
  return operations_.length ? operations_ : null
})

function onQueriesResponse({ operation }) {
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
    v-model:search="search"
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
          <small class="me-3">{{ distanceToNow(log.started_at) }} </small>
          <YIcon :iname="log.icon" :class="'text-' + log.class" />
          {{ log.description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>
  </ViewSearch>
</template>
