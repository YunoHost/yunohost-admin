<template>
  <div class="diagnosis">
    <div class="actions">
      <div class="buttons ml-auto">
        <b-button @click="shareLogs">
          <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </b-button>
      </div>
    </div>

    <b-alert variant="info" show>
      {{ $t(reports ? 'diagnosis_explanation' : 'diagnosis_first_run') }}
      <b-button
        v-if="reports === null" @click="runFullDiagnosis"
        class="d-block mt-2" variant="info"
      >
        <icon iname="stethoscope" /> {{ $t('run_first_diagnosis') }}
      </b-button>
    </b-alert>

    <b-alert
      class="mb-5" variant="warning" show
      v-t="'diagnosis_experimental_disclaimer'"
    />

    <!-- REPORT CARD -->
    <b-card no-body v-for="({ id, description, noIssues, errors, warnings, ignoreds, timestamp, items }, r) in reports" :key="id">
      <!-- REPORT HEADER -->
      <b-card-header class="d-flex align-items-md-center flex-column flex-md-row">
        <div class="d-flex align-items-center">
          <h2>{{ description }}</h2>

          <b-badge
            v-if="noIssues" pill variant="success"
            v-t="'everything_good'"
          />
          <b-badge
            v-if="errors" variant="danger" pill
            v-t="{ path: 'issues', args: { count: errors } }"
          />
          <b-badge v-if="warnings" variant="warning" v-t="{ path: 'warnings', args: { count: warnings } }" />
          <b-badge v-if="ignoreds" v-t="{ path: 'ignored', args: { count: ignoreds } }" />
        </div>

        <div class="d-flex ml-md-auto mt-2 mt-md-0">
          <b-button size="sm" :variant="items ? 'info' : 'success'" @click="reRunDiagnosis(id)">
            <icon iname="refresh" /> {{ $t('rerun_diagnosis') }}
          </b-button>

          <b-button
            size="sm" variant="outline-secondary" class="ml-auto ml-md-2"
            v-b-toggle="'collapse-' + id"
          >
            <icon iname="chevron-right" /><span class="sr-only">{{ $t('words.collapse') }}</span>
          </b-button>
        </div>
      </b-card-header>

      <!-- REPORT BODY -->
      <b-collapse :id="'collapse-' + id" :visible="!noIssues">
        <p class="last-time-run">
          {{ $t('last_ran') }} {{ timestamp | distanceToNow(true, true) }}
        </p>

        <b-list-group flush>
          <!-- REPORT ITEM -->
          <b-list-group-item
            v-for="({ status, icon, summary, ignored, issue, details, filterArgs, meta }, i) in items"
            :key="i" :variant="status"
          >
            <div class="item-button d-flex align-items-center">
              <icon :iname="icon" class="mr-1" /> <p class="mb-0 mr-2" v-html="summary" />

              <div class="d-flex flex-column flex-lg-row ml-auto">
                <b-button
                  v-if="ignored" size="sm"
                  @click="toggleIgnoreIssue(false, filterArgs, r, i)"
                >
                  <icon iname="bell" /> <span v-t="'unignore'" />
                </b-button>
                <b-button
                  v-else-if="issue"
                  variant="warning" size="sm" @click="toggleIgnoreIssue(true, filterArgs, r, i)"
                >
                  <icon iname="bell-slash" /> <span v-t="'ignore'" />
                </b-button>
                <b-button
                  v-if="details"
                  size="sm" variant="light" class="ml-lg-2 mt-2 mt-lg-0"
                  v-b-toggle="'collapse-' + id + '-item-' + i"
                >
                  <icon iname="level-down" /> <span v-t="'details'" />
                </b-button>
              </div>
            </div>

            <b-collapse v-if="details" :id="'collapse-' + id + '-item-' + i">
              <ul class="mt-2 pl-4">
                <li v-for="(detail, index) in details" :key="index" v-html="detail" />
              </ul>
            </b-collapse>
          </b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
  </div>
</template>

<script>
import api from '@/helpers/api'
import { distanceToNow } from '@/filters/date'

export default {
  name: 'Diagnosis',

  data () {
    return {
      reports: undefined
    }
  },

  filters: {
    distanceToNow
  },

  methods: {
    fetchData () {
      api.get('diagnosis/show?full').then(({ reports }) => {
        if (!Array.isArray(reports)) {
          this.reports = null
          return
        }

        for (var report of reports) {
          report.warnings = 0
          report.errors = 0
          report.ignoreds = 0

          for (var item of report.items) {
            let issue = false
            let icon = ''
            const status = item.status = item.status.toLowerCase()

            if (status === 'success') {
              icon = 'check-circle'
            } else if (status === 'info') {
              icon = 'info-circle'
            } else if (item.ignored) {
              icon = status !== 'error' ? status : 'times'
              item.status = 'ignored'
              report.ignoreds++
            } else if (status === 'warning') {
              icon = status
              issue = true
              report.warnings++
            } else if (status === 'error') {
              item.status = 'danger'
              icon = 'times'
              issue = true
              report.errors++
            }

            item.issue = issue
            item.icon = icon
            item.filterArgs = Object.entries(item.meta).reduce((filterArgs, entries) => {
              filterArgs.push(entries.join('='))
              return filterArgs
            }, [report.id])
          }
          report.noIssues = report.warnings + report.errors === 0
        }
        this.reports = reports
      })
    },

    runFullDiagnosis () {
      api.post('diagnosis/run').then(this.fetchData)
    },

    reRunDiagnosis (id) {
      api.post('diagnosis/run?force', { categories: [id] }).then(this.fetchData)
    },

    toggleIgnoreIssue (ignore, filterArgs, reportIndex, itemIndex) {
      const key = (ignore ? 'add' : 'remove') + '_filter'
      api.post('diagnosis/ignore', { [key]: filterArgs }).then(this.fetchData)
    },

    shareLogs () {
      api.get('diagnosis/show?share').then(({ url }) => {
        window.open(url, '_blank')
      })
    }
  },

  created () {
    api.post('diagnosis/run?except-if-never-ran-yet').then(this.fetchData)
  }
}
</script>

<style lang="scss" scoped>
.badge {
  margin-left: .5rem
}

p.last-time-run {
  margin: .75rem 1rem;
}

.item-button {
  button {
    min-width: 6rem;
  }
}
</style>
