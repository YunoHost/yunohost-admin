<script setup lang="ts">
import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'
import { STATUS_VARIANT, isOkStatus } from '@/helpers/yunohostArguments'
import type { StateStatus } from '@/types/commons'
import type { Diagnosis } from '@/types/core/api'

const reports = await api
  .fetchAll<[null, Diagnosis | null]>([
    {
      method: 'PUT',
      uri: 'diagnosis/run?except_if_never_ran_yet',
      humanKey: 'diagnosis.run',
    },
    { uri: 'diagnosis?full' },
  ])
  .then(([_, diagnosis]) => {
    if (!diagnosis) return null

    return diagnosis.reports.map((report) => {
      const badges = {
        warnings: 0,
        errors: 0,
        ignoreds: 0,
      }

      const items = report.items.map((item) => {
        const status = item.status.toLowerCase() as StateStatus
        const variant = STATUS_VARIANT[status]
        const issue = !isOkStatus(status)

        if (item.ignored) badges.ignoreds++
        else if (issue) badges[`${status}s`]++

        return { ...item, status, issue, variant }
      })
      return {
        ...report,
        ...badges,
        items,
        noIssues: badges.warnings + badges.errors === 0,
      }
    })
  })

type Report = Exclude<typeof reports, null>[number]

function runDiagnosis(report?: { id: string; description: string }) {
  const id = report?.id
  api
    .put({
      uri: 'diagnosis/run' + id ? '?force' : '',
      data: id ? { categories: [id] } : {},
      humanKey: {
        key: 'diagnosis.run' + (id ? '_specific' : ''),
        description: report?.description,
      },
    })
    .then(() => api.refetch())
}

function toggleIgnoreIssue(
  action: 'ignore' | 'unignore',
  report: Report,
  item: Report['items'][number],
) {
  const filterArgs = [report.id].concat(
    Object.entries(item.meta).map((entries) => entries.join('=')),
  )

  api
    .put({
      uri: 'diagnosis/' + action,
      data: { filter: filterArgs },
      humanKey: `diagnosis.${action}.${item.status}`,
    })
    .then(() => {
      item.ignored = action === 'ignore'
      const count = item.ignored ? 1 : -1
      report.ignoreds += count
      if (!isOkStatus(item.status)) {
        report[`${item.status}s`] -= count
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
  <div>
    <TopBar>
      <template #group-right>
        <BButton @click="shareLogs" variant="success">
          <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </BButton>
      </template>
    </TopBar>

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
  </div>
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
