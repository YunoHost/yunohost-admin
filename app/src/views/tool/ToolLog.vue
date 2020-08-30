<template>
  <div class="tool-log">
    <!-- INFO CARD -->
    <b-card class="mb-3">
      <template v-slot:header>
        <h2><icon iname="info-circle" /> {{ description }}</h2>
      </template>

      <dl>
        <dt v-t="'logs_path'" />
        <dd>{{ log_path }}</dd>
        <hr>

        <template v-if="metadata.started_at">
          <dt v-t="'logs_started_at'" />
          <dd>{{ metadata.started_at | readableDate }}</dd>
          <hr>
        </template>

        <template v-if="metadata.ended_at">
          <dt v-t="'logs_ended_at'" />
          <dd>{{ metadata.ended_at | readableDate }}</dd>
          <hr>
        </template>

        <template v-if="metadata.error">
          <dt v-t="'logs_ended_at'" />
          <dd>{{ metadata.error }}</dd>
          <hr>
        </template>
      </dl>
    </b-card>

    <b-alert v-if="metadata.error" variant="danger" show>
      <icon iname="exclamation-circle" /> {{ $t('operation_failed_explanation') }}
    </b-alert>

    <!-- LOGS CARD -->
    <b-card class="log">
      <template v-slot:header>
        <div class="d-sm-flex justify-content-sm-between">
          <h2><icon iname="file-text" /> {{ metadata ? $t('logs') : log_path }}</h2>
          <b-button @click="shareLogs">
            <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
          </b-button>
        </div>
      </template>
      <b-button
        v-if="moreLogsAvailable"
        variant="info" class="w-100 rounded-0"
        @click="fetchData"
      >
        <icon iname="plus" /> {{ $t('logs_more') }}
      </b-button>
      <pre><code v-html="logs" /></pre>
    </b-card>
  </div>
</template>

<script>
import api from '@/helpers/api'
import { readableDate } from '@/filters/date'

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
      log_path: '',
      logs: '',
      metadata: {},
      // Logs line display
      numberOfLines: 50,
      moreLogsAvailable: false
    }
  },

  filters: {
    readableDate
  },

  methods: {
    fetchData () {
      const params = {
        path: this.name,
        filter_irrelevant: '',
        number: this.numberOfLines
      }

      api.get('logs/display', params).then(log => {
        if (log.logs.length === this.numberOfLines) {
          this.moreLogsAvailable = true
          this.numberOfLines *= 10
        } else {
          this.moreLogsAvailable = false
        }
        this.description = log.description
        this.log_path = log.log_path
        this.metadata = log.metadata

        const levels = ['ERROR', 'WARNING', 'SUCCESS', 'INFO']
        this.logs = log.logs.map(line => {
          for (const level of levels) {
            if (line.includes(level + ' -')) {
              return `<span class="alert-${level === 'ERROR' ? 'danger' : level.toLowerCase()}">${line}</span>`
            }
          }
          return line
        }).join('\n')
      })
    },

    shareLogs () {
      api.get('/logs/display', { path: this.name, share: '' }).then(({ url }) => {
        window.open(url, '_blank')
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
