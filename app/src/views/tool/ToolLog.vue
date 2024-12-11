<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { escapeHtml } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'
import type { LogInfo } from '@/types/core/api'

const props = withDefaults(
  defineProps<{
    name: string
    n?: string
  }>(),
  {
    n: '25',
  },
)

const linesNumber = computed(() => {
  return parseInt(props.n) || 25
})

const router = useRouter()

const { description, logs, moreLogsAvailable, info } = await api
  .fetch<LogInfo>({
    uri: `logs/${props.name}?${objectToParams({
      filter_irrelevant: '',
      with_suboperations: '',
      number: linesNumber.value,
    })}`,
  })
  .then((log) => {
    const levels = ['ERROR', 'WARNING', 'SUCCESS', 'INFO']
    const logs = log.logs
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
    const { started_at, ended_at, error, suboperations } = log.metadata
    return {
      description: log.description,
      logs,
      moreLogsAvailable: log.logs.length === linesNumber.value,
      info: {
        path: log.log_path,
        started_at: readableDate(started_at),
        ended_at: ended_at ? readableDate(ended_at) : null,
        error: error ? !!error : null,
        suboperations:
          suboperations && suboperations.length ? suboperations : null,
      },
    }
  })

function shareLogs() {
  api
    .get<{ url: string }>({
      uri: `logs/${props.name}/share`,
      websocket: true,
    })
    .then(({ url }) => {
      window.open(url, '_blank')
    })
}
</script>

<template>
  <div>
    <!-- INFO CARD -->
    <YCard :title="description" icon="info-circle">
      <template v-for="(value, prop) in info" :key="prop">
        <BRow v-if="value !== null" no-gutters class="row-line">
          <BCol md="3" xl="2">
            <strong>{{ $t('logs_' + prop) }}</strong>
          </BCol>

          <BCol>
            <div v-if="prop === 'suboperations'">
              <div
                v-for="operation in value as LogInfo['metadata']['suboperations']"
                :key="operation.name"
              >
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
      </template>
    </YCard>

    <div v-if="info.error" class="alert alert-danger my-5">
      <YIcon iname="exclamation-circle" />
      <span v-html="$t('operation_failed_explanation')" />
    </div>

    <!-- LOGS CARD -->
    <YCard :title="$t('logs')" icon="file-text" no-body>
      <template #header-buttons>
        <BButton variant="success" @click="shareLogs">
          <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </BButton>
      </template>

      <BButton
        v-if="moreLogsAvailable"
        class="w-100 rounded-0"
        @click="router.replace({ params: { n: linesNumber * 10 } })"
      >
        <YIcon iname="plus" /> {{ $t('logs_more') }}
      </BButton>

      <pre class="log unselectable"><code v-html="logs" /></pre>
      <BButton variant="success" class="w-100 rounded-0" @click="shareLogs">
        <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </BButton>
    </YCard>

    <p class="w-100 px-5 py-2 mb-0" v-html="$t('text_selection_is_disabled')" />
  </div>
</template>
