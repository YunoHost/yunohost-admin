<template>
  <div class="tool-log">
    <!-- INFO CARD -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="info-circle" /> {{ description }}</h2>
      </template>

      <b-row
        v-for="(value, prop) in info" :key="prop"
        no-gutters class="row-line"
      >
        <b-col cols="auto" md="3">
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
    </b-card>

    <b-alert
      v-if="info.error" variant="danger" show
      class="my-5"
    >
      <icon iname="exclamation-circle" /> <span v-html="$t('operation_failed_explanation')" />
    </b-alert>

    <!-- LOGS CARD -->
    <b-card class="log">
      <template v-slot:header>
        <div class="d-sm-flex justify-content-sm-between">
          <h2><icon iname="file-text" /> {{ $t('logs') }}</h2>
          <b-button @click="shareLogs" variant="success">
            <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
          </b-button>
        </div>
      </template>

      <b-button
        v-if="moreLogsAvailable"
        variant="white" class="w-100 rounded-0"
        @click="fetchData"
      >
        <icon iname="plus" /> {{ $t('logs_more') }}
      </b-button>

      <pre><code v-html="logs" /></pre>

      <b-button @click="shareLogs" variant="success" class="w-100 rounded-0">
        <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </b-button>
    </b-card>
  </div>
</template>

<script>
import api from '@/api'
import { objectToParams } from '@/helpers/commons'
import { readableDate } from '@/helpers/filters/date'

export default {
  name: 'ToolLog',

  props: {
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      // Log data
      description: '',
      info: {},
      logs: '',
      // Logs line display
      numberOfLines: 25,
      moreLogsAvailable: false
    }
  },

  filters: {
    readableDate
  },

  methods: {
    fetchData () {
      const queryString = objectToParams({
        path: this.name,
        filter_irrelevant: '',
        with_suboperations: '',
        number: this.numberOfLines
      })

      api.get('logs/display?' + queryString).then(log => {
        if (log.logs.length === this.numberOfLines) {
          this.moreLogsAvailable = true
          this.numberOfLines *= 10
        } else {
          this.moreLogsAvailable = false
        }
        this.description = log.description

        const levels = ['ERROR', 'WARNING', 'SUCCESS', 'INFO']
        this.logs = log.logs.map(line => {
          for (const level of levels) {
            if (line.includes(level + ' -')) {
              return `<span class="alert-${level === 'ERROR'
                ? 'danger'
                : level.toLowerCase()}">${line}</span>`
            }
          }
          return line
        }).join('\n')

        const { started_at, ended_at, error, success, suboperations } = log.metadata
        const info = { path: log.log_path, started_at, ended_at }
        if (!success) info.error = error
        if (suboperations) info.suboperations = suboperations
        this.info = info
      })
    },

    shareLogs () {
      api.get(`/logs/display?path=${this.name}&share`).then(({ url }) => {
        window.open(url, '_blank')
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
