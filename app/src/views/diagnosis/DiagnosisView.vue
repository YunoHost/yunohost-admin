<script setup lang="ts">
import { ref } from 'vue'

import api from '@/api'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { distanceToNow } from '@/helpers/filters/date'
import { DEFAULT_STATUS_ICON } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'

const { loading, refetch } = useInitialQueries(
  [
    ['PUT', 'diagnosis/run?except_if_never_ran_yet', {}, 'diagnosis.run'],
    ['GET', 'diagnosis?full'],
  ],
  { wait: true, onQueriesResponse },
)
const { dark } = useStoreGetters()

const reports = ref()

function onQueriesResponse(_: any, reportsData: any) {
  if (reportsData === null) {
    reports.value = null
    return
  }

  const reports_ = reportsData.reports
  for (const report of reports_) {
    report.warnings = 0
    report.errors = 0
    report.ignoreds = 0

    for (const item of report.items) {
      const status = (item.variant = item.status.toLowerCase())
      item.icon = DEFAULT_STATUS_ICON[status]
      item.issue = false

      if (item.ignored) {
        report.ignoreds++
      }
      if (status === 'warning') {
        item.issue = true
        if (!item.ignored) {
          report.warnings++
        }
      } else if (status === 'error') {
        item.variant = 'danger'
        item.issue = true
        if (!item.ignored) {
          report.errors++
        }
      }
    }

    report.noIssues = report.warnings + report.errors === 0
  }
  reports.value = reports_
}

function runDiagnosis({ id = null, description } = {}) {
  const param = id !== null ? '?force' : ''
  const data = id !== null ? { categories: [id] } : {}

  api
    .put('diagnosis/run' + param, data, {
      key: 'diagnosis.run' + (id !== null ? '_specific' : ''),
      description,
    })
    .then(() => refetch(false))
}

function toggleIgnoreIssue(action, report, item) {
  const filterArgs = [report.id].concat(
    Object.entries(item.meta).map((entries) => entries.join('=')),
  )

  api
    .put(
      'diagnosis/' + action,
      { filter: filterArgs },
      `diagnosis.${action}.${item.status.toLowerCase()}`,
    )
    .then(() => {
      item.ignored = action === 'ignore'
      if (item.ignored) {
        report[item.status.toLowerCase() + 's']--
        report.ignoreds++
      } else {
        report[item.status.toLowerCase() + 's']++
        report.ignoreds--
      }
    })
}

function shareLogs() {
  api.get('diagnosis?share').then(({ url }) => {
    window.open(url, '_blank')
  })
}
</script>

<template>
  <ViewBase :loading="loading">
    <template #top-bar-group-right>
      <BButton @click="shareLogs" variant="success">
        <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
      </BButton>
    </template>

    <template #top>
      <div class="alert alert-info">
        {{ $t(reports ? 'diagnosis_explanation' : 'diagnosis_first_run') }}
        <BButton
          v-if="reports === null"
          class="d-block mt-2"
          variant="info"
          @click="runDiagnosis()"
        >
          <YIcon iname="stethoscope" /> {{ $t('run_first_diagnosis') }}
        </BButton>
      </div>
    </template>

    <!-- REPORT CARD -->
    <YCard
      v-for="report in reports"
      :key="report.id"
      collapsable
      :collapsed="report.noIssues"
      no-body
      button-unbreak="lg"
    >
      <!-- REPORT HEADER -->
      <template #header>
        <h2>{{ report.description }}</h2>

        <div class="">
          <BBadge
            v-if="report.noIssues"
            variant="success"
            v-t="'everything_good'"
          />
          <BBadge
            v-if="report.errors"
            variant="danger"
            v-t="{ path: 'issues', args: { count: report.errors } }"
          />
          <BBadge
            v-if="report.warnings"
            variant="warning"
            v-t="{ path: 'warnings', args: { count: report.warnings } }"
          />
          <BBadge
            v-if="report.ignoreds"
            v-t="{ path: 'ignored', args: { count: report.ignoreds } }"
          />
        </div>
      </template>

      <template #header-buttons>
        <BButton
          size="sm"
          :variant="report.items ? 'info' : 'success'"
          @click="runDiagnosis(report)"
        >
          <YIcon iname="refresh" /> {{ $t('rerun_diagnosis') }}
        </BButton>
      </template>

      <!-- REPORT BODY -->
      <p class="last-time-run">
        {{ $t('last_ran') }} {{ distanceToNow(report.timestamp, true, true) }}
      </p>

      <BListGroup flush>
        <!-- REPORT ITEM -->
        <YListGroupItem
          v-for="(item, i) in report.items"
          :key="i"
          :variant="item.variant"
          :icon="item.Icon"
          :faded="item.ignored"
        >
          <div class="item-button d-flex align-items-center">
            <p class="mb-0 me-2" v-html="item.summary" />

            <div class="d-flex flex-column flex-lg-row ms-auto">
              <BButton
                v-if="item.ignored"
                size="sm"
                @click="toggleIgnoreIssue('unignore', report, item)"
              >
                <YIcon iname="bell" /> {{ $t('unignore') }}
              </BButton>
              <BButton
                v-else-if="item.issue"
                variant="warning"
                size="sm"
                @click="toggleIgnoreIssue('ignore', report, item)"
              >
                <YIcon iname="bell-slash" /> {{ $t('ignore') }}
              </BButton>

              <BButton
                v-if="item.details"
                size="sm"
                variant="outline-dark"
                class="ms-lg-2 mt-2 mt-lg-0"
                v-b-toggle="`collapse-${report.id}-item-${i}`"
              >
                <YIcon iname="level-down" /> {{ $t('details') }}
              </BButton>
            </div>
          </div>

          <BCollapse
            v-if="item.details"
            :id="`collapse-${report.id}-item-${i}`"
          >
            <ul class="mt-2 ps-4">
              <li
                v-for="(detail, index) in item.details"
                :key="index"
                v-html="detail"
              />
            </ul>
          </BCollapse>
        </YListGroupItem>
      </BListGroup>
    </YCard>

    <template #skeleton>
      <CardListSkeleton />
      <BCard no-body>
        <template #header>
          <BSkeleton width="30%" height="36px" class="m-0" />
        </template>
      </BCard>
      <CardListSkeleton />
    </template>
  </ViewBase>
</template>

<style lang="scss" scoped>
.badge + .badge {
  margin-left: 0.5rem;
}

p.last-time-run {
  margin: 0.75rem 1rem;
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
