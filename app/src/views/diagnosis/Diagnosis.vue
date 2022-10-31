<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse" queries-wait
    ref="view"
  >
    <template #top-bar-group-right>
      <b-button @click="shareLogs" variant="success">
        <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </b-button>
    </template>

    <template #top>
      <div class="alert alert-info">
        {{ $t(reports ? 'diagnosis_explanation' : 'diagnosis_first_run') }}
        <b-button
          v-if="reports === null" class="d-block mt-2" variant="info"
          @click="runDiagnosis()"
        >
          <icon iname="stethoscope" /> {{ $t('run_first_diagnosis') }}
        </b-button>
      </div>
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
        <b-button size="sm" :variant="report.items ? 'info' : 'success'" @click="runDiagnosis(report)">
          <icon iname="refresh" /> {{ $t('rerun_diagnosis') }}
        </b-button>
      </template>

      <!-- REPORT BODY -->
      <p class="last-time-run">
        {{ $t('last_ran') }} {{ report.timestamp | distanceToNow(true, true) }}
      </p>

      <b-list-group flush>
        <!-- REPORT ITEM -->
        <yuno-list-group-item
          v-for="(item, i) in report.items" :key="i"
          :variant="item.variant" :icon="item.icon" :faded="item.ignored"
        >
          <div class="item-button d-flex align-items-center">
            <p class="mb-0 mr-2" v-html="item.summary" />

            <div class="d-flex flex-column flex-lg-row ml-auto">
              <b-button
                v-if="item.ignored" size="sm"
                @click="toggleIgnoreIssue('unignore', report, item)"
              >
                <icon iname="bell" /> {{ $t('unignore') }}
              </b-button>
              <b-button
                v-else-if="item.issue" variant="warning" size="sm"
                @click="toggleIgnoreIssue('ignore', report, item)"
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
        </yuno-list-group-item>
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
import { mapGetters } from 'vuex'

import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'
import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'

export default {
  name: 'Diagnosis',

  data () {
    return {
      queries: [
        ['PUT', 'diagnosis/run?except_if_never_ran_yet', {}, 'diagnosis.run'],
        ['GET', 'diagnosis?full']
      ],
      reports: undefined
    }
  },

  computed: {
    ...mapGetters(['theme'])
  },

  methods: {
    onQueriesResponse (_, reportsData) {
      if (reportsData === null) {
        this.reports = null
        return
      }

      const reports = reportsData.reports
      for (const report of reports) {
        report.warnings = 0
        report.errors = 0
        report.ignoreds = 0

        for (const item of report.items) {
          const status = item.variant = item.status.toLowerCase()
          item.icon = DEFAULT_STATUS_ICON[status]
          item.issue = false

          if (item.ignored) {
            item.variant = 'light'
            report.ignoreds++
          } else if (status === 'warning') {
            item.issue = true
            report.warnings++
          } else if (status === 'error') {
            item.variant = 'danger'
            item.issue = true
            report.errors++
          }
        }

        report.noIssues = report.warnings + report.errors === 0
      }
      this.reports = reports
    },

    runDiagnosis ({ id = null, description } = {}) {
      const param = id !== null ? '?force' : ''
      const data = id !== null ? { categories: [id] } : {}

      api.put(
        'diagnosis/run' + param,
        data,
        { key: 'diagnosis.run' + (id !== null ? '_specific' : ''), description }
      ).then(this.$refs.view.fetchQueries)
    },

    toggleIgnoreIssue (action, report, item) {
      const filterArgs = [report.id].concat(Object.entries(item.meta).map(entries => entries.join('=')))

      api.put(
        'diagnosis/' + action,
        { filter: filterArgs },
        `diagnosis.${action}.${item.status.toLowerCase()}`
      ).then(() => {
        item.ignored = action === 'ignore'
        if (item.ignored) {
          report[item.status.toLowerCase() + 's']--
        } else {
          report.ignoreds--
        }
        this.formatReportItem(report, item)
      })
    },

    shareLogs () {
      api.get('diagnosis?share').then(({ url }) => {
        window.open(url, '_blank')
      })
    }
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

.list-group {
  border-top: $list-group-border-width solid $list-group-border-color;
}

.item-button {
  button {
    min-width: 6rem;
  }
}
</style>
