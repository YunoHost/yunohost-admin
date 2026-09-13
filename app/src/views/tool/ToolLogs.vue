<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'

import api from '@/api'
import { useSearch } from '@/composables/useSearch'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import type { Obj } from '@/types/commons'
import type { LogList } from '@/types/core/api'

const limit = 25

function fetchOperations(before?: string) {
  return api
    .fetch<LogList>({
      uri: `logs?limit=${limit}&with_details${before ? `&before=${before}` : ''}`,
    })
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
}

const operations = ref(await fetchOperations())
const moreOperations = ref(operations.value.length === limit)
let loading = false

// Load the next page when the bottom of the list is about to become visible
const sentinel = useTemplateRef<HTMLElement>('sentinel')
useIntersectionObserver(
  sentinel,
  async ([entry]) => {
    if (loading || !entry?.isIntersecting) return
    loading = true
    try {
      const last = operations.value[operations.value.length - 1]
      const page = await fetchOperations(last.name)
      operations.value.push(...page)
      moreOperations.value = page.length === limit
    } finally {
      loading = false
    }
  },
  { rootMargin: '200px' },
)

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
      <!-- Re-created after each page so the observer fires again if it is still in view -->
      <div v-if="moreOperations" ref="sentinel" :key="operations.length" />
    </YCard>
  </ViewSearch>
</template>
