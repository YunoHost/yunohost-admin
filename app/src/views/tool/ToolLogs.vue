<script setup lang="ts">
import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import type { Obj } from '@/types/commons'
import type { LogList } from '@/types/core/api'

const operations = await api
  .fetch<LogList>({ uri: `logs?limit=${25}&with_details` })
  .then((logs) => {
    const iconAndClass = {
      '?': { icon: 'question', class: 'text-warning' },
      true: { icon: 'check', class: 'text-success' },
      false: { icon: 'close', class: 'text-danger' },
    } as Obj<{ icon: string; class: string }>
    return logs.operation.map((log) => ({
      ...log,
      ...iconAndClass[String(log.success) as keyof typeof iconAndClass],
    }))
  })

const [search, filteredOperations] = useSearch(operations, (s, op) => {
  return op.description.toLowerCase().includes(s)
})
</script>

<template>
  <ViewSearch v-model="search" :items="filteredOperations" items-name="logs">
    <YCard :title="$t('logs_operation')" icon="wrench" no-body>
      <BListGroup flush>
        <BListGroupItem
          v-for="log in filteredOperations"
          :key="log.name"
          :to="{ name: 'tool-log', params: { name: log.name || log.path } }"
          :title="readableDate(log.started_at)"
        >
          <small class="me-3">{{ distanceToNow(log.started_at) }}</small>
          <YIcon :iname="log.icon" :class="log.class" />
          {{ log.description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>
  </ViewSearch>
</template>
