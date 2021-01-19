<template>
  <view-base
    :loading="loading" ref="view"
    :queries="queries" @queries-response="formatData"
  >
    <template #top-bar-group-right>
      <b-button @click="shareLogs" variant="success">
        <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </b-button>
    </template>

    <template #top>
      <div class="alert alert-info">
        {{ $t(reports || loading ? 'diagnosis_explanation' : 'diagnosis_first_run') }}
        <b-button
          v-if="reports === null" class="d-block mt-2" variant="info"
          @click="runDiagnosis"
        >
          <icon iname="stethoscope" /> {{ $t('run_first_diagnosis') }}
        </b-button>
      </div>

      <div v-t="'diagnosis_experimental_disclaimer'" class="alert alert-warning mb-5" />
    </template>

    <!-- REPORT CARD -->
    <card
      v-for="report in reports" :key="report.id"
      collapsable :collapsed="report.noIssues"
      no-body button-unbreak="lg"
    >
      <!-- REPORT HEADER -->
      <template #header>
        <h2>{{ report.description }}</h2>

        <div class="">
          <b-badge v-if="report.noIssues" variant="success" v-t="'everything_good'" />
          <b-badge v-if="report.errors" variant="danger" v-t="{ path: 'issues', args: { count: report.errors } }" />
          <b-badge v-if="report.warnings" variant="warning" v-t="{ path: 'warnings', args: { count: report.warnings } }" />
          <b-badge v-if="report.ignoreds" v-t="{ path: 'ignored', args: { count: report.ignoreds } }" />
        </div>
      </template>

      <template #header-buttons>
        <b-button size="sm" :variant="report.items ? 'info' : 'success'" @click="runDiagnosis(report.id)">
          <icon iname="refresh" /> {{ $t('rerun_diagnosis') }}
        </b-button>
      </template>

      <!-- REPORT BODY -->
      <p class="last-time-run">
        {{ $t('last_ran') }} {{ report.timestamp | distanceToNow(true, true) }}
      </p>

      <b-list-group flush>
        <!-- REPORT ITEM -->
        <b-list-group-item
          v-for="(item, i) in report.items" :key="i"
          :variant="item.variant"
        >
          <div class="item-button d-flex align-items-center">
            <icon :iname="item.icon" class="mr-1" /> <p class="mb-0 mr-2" v-html="item.summary" />

            <div class="d-flex flex-column flex-lg-row ml-auto">
              <b-button
                v-if="item.ignored" size="sm"
                @click="toggleIgnoreIssue(false, report, item)"
              >
                <icon iname="bell" /> {{ $t('unignore') }}
              </b-button>
              <b-button
                v-else-if="item.issue" variant="warning" size="sm"
                @click="toggleIgnoreIssue(true, report, item)"
              >
                <icon iname="bell-slash" /> {{ $t('ignore') }}
              </b-button>
              <b-button
                v-if="item.details"
                size="sm" variant="outline-dark" class="ml-lg-2 mt-2 mt-lg-0"
                v-b-toggle="`collapse-${report.id}-item-${i}`"
              >
                <icon iname="level-down" /> {{ $t('details') }}
              </b-button>
            </div>
          </div>

          <b-collapse v-if="item.details" :id="`collapse-${report.id}-item-${i}`">
            <ul class="mt-2 pl-4">
              <li v-for="(detail, index) in item.details" :key="index" v-html="detail" />
            </ul>
          </b-collapse>
        </b-list-group-item>
      </b-list-group>
    </card>

    <template #skeleton>
      <card-list-skeleton />
      <b-card no-body>
        <template #header>
          <b-skeleton width="30%" height="36px" class="m-0" />
        </template>
      </b-card>
      <card-list-skeleton />
    </template>
  </view-base>
</template>

<script>
import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'

export default {
  name: 'Diagnosis',

  data () {
    return {
      queries: ['diagnosis/show?full'],
      loading: true,
      reports: undefined
    }
  },

  methods: {
    formatReportItem (report, item) {
      let issue = false
      let icon = ''
      const status = item.variant = item.status.toLowerCase()

      if (status === 'success') {
        icon = 'check-circle'
      } else if (status === 'info') {
        icon = 'info-circle'
      } else if (item.ignored) {
        icon = status !== 'error' ? status : 'times'
        item.variant = 'light'
        report.ignoreds++
      } else if (status === 'warning') {
        icon = status
        issue = true
        report.warnings++
      } else if (status === 'error') {
        item.variant = 'danger'
        icon = 'times'
        issue = true
        report.errors++
      }

      item.issue = issue
      item.icon = icon
    },

    formatData (data) {
      if (data === null) {
        this.reports = null
        this.loading = false
        return
      }

      const reports = data.reports
      for (const report of reports) {
        report.warnings = 0
        report.errors = 0
        report.ignoreds = 0

        for (const item of report.items) {
          this.formatReportItem(report, item)
        }
        report.noIssues = report.warnings + report.errors === 0
      }
      this.reports = reports
      this.loading = false
    },

    runDiagnosis (id = null) {
      const param = id !== null ? '?force' : ''
      const data = id !== null ? { categories: [id] } : {}
      api.post('diagnosis/run' + param, data).then(this.$refs.view.fetchQueries)
    },

    toggleIgnoreIssue (ignore, report, item) {
      const key = (ignore ? 'add' : 'remove') + '_filter'
      const filterArgs = Object.entries(item.meta).reduce((filterArgs, entries) => {
        filterArgs.push(entries.join('='))
        return filterArgs
      }, [report.id])

      api.post('diagnosis/ignore', { [key]: filterArgs }).then(() => {
        item.ignored = ignore
        if (ignore) {
          report[item.status.toLowerCase() + 's']--
        } else {
          report.ignoreds--
        }
        this.formatReportItem(report, item)
      })
    },

    shareLogs () {
      api.get('diagnosis/show?share').then(({ url }) => {
        window.open(url, '_blank')
      })
    }
  },

  created () {
    api.post('diagnosis/run?except_if_never_ran_yet')
  },

  filters: { distanceToNow }
}
</script>

<style lang="scss" scoped>
.badge + .badge {
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
