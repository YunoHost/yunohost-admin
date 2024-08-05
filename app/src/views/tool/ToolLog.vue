<script setup lang="ts">
import { computed, ref } from 'vue'

import api, { objectToParams } from '@/api'
import type { APIQuery } from '@/api/api'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { escapeHtml } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'

const props = defineProps<{
  name: string
}>()

const numberOfLines = ref(25)
const queries = computed<APIQuery[]>(() => {
  const queryString = objectToParams({
    filter_irrelevant: '',
    with_suboperations: '',
    number: numberOfLines.value,
  })
  return [{ uri: `logs/${props.name}?${queryString}` }]
})
const { loading, refetch } = useInitialQueries(queries, {
  onQueriesResponse,
})

// Log data
const description = ref()
const info = ref({})
const logs = ref()
// Logs line display
const moreLogsAvailable = ref(false)

function onQueriesResponse(log: any) {
  if (log.logs.length === numberOfLines.value) {
    moreLogsAvailable.value = true
    numberOfLines.value *= 10
  } else {
    moreLogsAvailable.value = false
  }
  description.value = log.description

  const levels = ['ERROR', 'WARNING', 'SUCCESS', 'INFO']
  logs.value = log.logs
    .map((line) => {
      const escaped = escapeHtml(line)
      for (const level of levels) {
        if (line.includes(level + ' -')) {
          return `<span class="alert-${
            level === 'ERROR' ? 'danger' : level.toLowerCase()
          }">${escaped}</span>`
        }
      }
      return escaped
    })
    .join('\n')
  // eslint-disable-next-line
  const { started_at, ended_at, error, success, suboperations } = log.metadata
  const info_ = { path: log.log_path, started_at, ended_at }
  if (!success) info_.error = error
  if (suboperations && suboperations.length) info_.suboperations = suboperations
  // eslint-disable-next-line
  if (!ended_at) delete info_.ended_at
  info.value = info
}

function shareLogs() {
  api
    .get({
      uri: `logs/${props.name}/share`,
      humanKey: { key: 'share_logs', name: props.name },
      websocket: true,
    })
    .then(({ url }) => {
      window.open(url, '_blank')
    })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardInfoSkeleton">
    <!-- INFO CARD -->
    <YCard :title="description" icon="info-circle">
      <BRow
        v-for="(value, prop) in info"
        :key="prop"
        no-gutters
        class="row-line"
      >
        <BCol md="3" xl="2">
          <strong>{{ $t('logs_' + prop) }}</strong>
        </BCol>

        <BCol>
          <span v-if="prop.endsWith('_at')">{{ readableDate(value) }}</span>

          <div v-else-if="prop === 'suboperations'">
            <div v-for="operation in value" :key="operation.name">
              <YIcon
                v-if="operation.success !== true"
                iname="times"
                class="text-danger"
              />
              <BLink
                :to="{ name: 'tool-log', params: { name: operation.name } }"
              >
                {{ operation.description }}
              </BLink>
            </div>
          </div>

          <span v-else>{{ value }}</span>
        </BCol>
      </BRow>
    </YCard>

    <div v-if="info.error" class="alert alert-danger my-5">
      <YIcon iname="exclamation-circle" />
      <span v-html="$t('operation_failed_explanation')" />
    </div>

    <!-- LOGS CARD -->
    <YCard :title="$t('logs')" icon="file-text" no-body>
      <template #header-buttons>
        <BButton @click="shareLogs" variant="success">
          <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </BButton>
      </template>

      <BButton
        v-if="moreLogsAvailable"
        variant="white"
        class="w-100 rounded-0"
        @click="refetch(false)"
      >
        <YIcon iname="plus" /> {{ $t('logs_more') }}
      </BButton>

      <pre class="log unselectable"><code v-html="logs" /></pre>
      <BButton @click="shareLogs" variant="success" class="w-100 rounded-0">
        <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </BButton>
    </YCard>

    <p class="w-100 px-5 py-2 mb-0" v-html="$t('text_selection_is_disabled')" />
  </ViewBase>
</template>
