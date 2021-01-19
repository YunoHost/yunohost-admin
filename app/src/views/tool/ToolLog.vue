<template>
  <view-base
    :queries="queries" @queries-response="formatLogData"
    ref="view" skeleton="card-info-skeleton"
  >
    <!-- INFO CARD -->
    <card :title="description" icon="info-circle">
      <b-row
        v-for="(value, prop) in info" :key="prop"
        no-gutters class="row-line"
      >
        <b-col md="3" xl="2">
          <strong>{{ $t('logs_' + prop) }}</strong>
        </b-col>

        <b-col>
          <span v-if="prop.endsWith('_at')">{{ value | readableDate }}</span>

          <div v-else-if="prop === 'suboperations'">
            <div v-for="operation in value" :key="operation.name">
              <icon v-if="!operation.success" iname="times" class="text-danger" />
              <b-link :to="{ name: 'tool-log', params: { name: operation.name } }">
                {{ operation.description }}
              </b-link>
            </div>
          </div>

          <span v-else>{{ value }}</span>
        </b-col>
      </b-row>
    </card>

    <div v-if="info.error" class="alert alert-danger my-5">
      <icon iname="exclamation-circle" /> <span v-html="$t('operation_failed_explanation')" />
    </div>

    <!-- LOGS CARD -->
    <card :title="$t('logs')" icon="file-text" no-body>
      <template #header-buttons>
        <b-button @click="shareLogs" variant="success">
          <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </b-button>
      </template>

      <b-button
        v-if="moreLogsAvailable"
        variant="white" class="w-100 rounded-0"
        @click="$refs.view.fetchQueries()"
      >
        <icon iname="plus" /> {{ $t('logs_more') }}
      </b-button>

      <pre class="log"><code v-html="logs" /></pre>

      <b-button @click="shareLogs" variant="success" class="w-100 rounded-0">
        <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </b-button>
    </card>
  </view-base>
</template>

<script>
import api from '@/api'
import { objectToParams, escapeHtml } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'

export default {
  name: 'ToolLog',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      // Log data
      description: undefined,
      info: {},
      logs: undefined,
      // Logs line display
      numberOfLines: 25,
      moreLogsAvailable: false
    }
  },

  computed: {
    queries () {
      const queryString = objectToParams({
        path: this.name,
        filter_irrelevant: '',
        with_suboperations: '',
        number: this.numberOfLines
      })
      return ['logs/display?' + queryString]
    }
  },

  methods: {
    formatLogData (log) {
      if (log.logs.length === this.numberOfLines) {
        this.moreLogsAvailable = true
        this.numberOfLines *= 10
      } else {
        this.moreLogsAvailable = false
      }
      this.description = log.description

      const levels = ['ERROR', 'WARNING', 'SUCCESS', 'INFO']
      this.logs = log.logs.map(line => {
        const escaped = escapeHtml(line)
        for (const level of levels) {
          if (line.includes(level + ' -')) {
            return `<span class="alert-${level === 'ERROR'
              ? 'danger'
              : level.toLowerCase()}">${escaped}</span>`
          }
        }
        return escaped
      }).join('\n')
      // eslint-disable-next-line
      const { started_at, ended_at, error, success, suboperations } = log.metadata
      const info = { path: log.log_path, started_at, ended_at }
      if (!success) info.error = error
      if (suboperations && suboperations.length) info.suboperations = suboperations
      this.info = info
    },

    shareLogs () {
      api.get(`/logs/display?path=${this.name}&share`).then(({ url }) => {
        window.open(url, '_blank')
      })
    }
  },

  filters: { readableDate }
}
</script>
