<script setup lang="ts">
import { reactive } from 'vue'

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
    },
    { uri: 'diagnosis?full' },
  ])
  .then(([_, diagnosis]) => {
    if (!diagnosis) return null

    return diagnosis.reports.map((report) => {
      const badges = reactive({
        warnings: 0,
        errors: 0,
        ignoreds: 0,
      })

      const items = reactive(
        report.items.map((item) => {
          const status = item.status.toLowerCase() as StateStatus
          const variant = STATUS_VARIANT[status]
          const issue = !isOkStatus(status)

          if (item.ignored) badges.ignoreds++
          else if (issue) badges[`${status}s`]++

          return { ...item, status, issue, variant }
        }),
      )
      return {
        ...report,
        badges,
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
      uri: 'diagnosis/run' + (id ? '?force' : ''),
      data: id ? { categories: [id] } : {},
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
    .put({ uri: 'diagnosis/' + action, data: { filter: filterArgs } })
    .then(() => {
      item.ignored = action === 'ignore'
      const count = item.ignored ? 1 : -1
      report.badges.ignoreds += count
      if (!isOkStatus(item.status)) {
        report.badges[`${item.status}s`] -= count
      }
    })
}

function shareLogs() {
  api.get<{ url: string }>('diagnosis?share').then(({ url }) => {
    window.open(url, '_blank')
  })
}
</script>

<template>
  <div>
    <TopBar>
      <template #group-right>
        <BButton variant="success" @click="shareLogs">
          <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </BButton>
      </template>
    </TopBar>

    <div class="alert alert-info">
      <!--
      i18n: diagnosis_explanation
      i18n: diagnosis_first_run
      -->
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
      collapsible
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
            v-t="'everything_good'"
            variant="success"
          />
          <!--
          i18n: issues
          i18n: warnings
          i18n: ignored
          -->
          <BBadge
            v-if="report.badges.errors"
            v-t="{ path: 'issues', args: { count: report.badges.errors } }"
            variant="danger"
          />
          <BBadge
            v-if="report.badges.warnings"
            v-t="{ path: 'warnings', args: { count: report.badges.warnings } }"
            variant="warning"
          />
          <BBadge
            v-if="report.badges.ignoreds"
            v-t="{ path: 'ignored', args: { count: report.badges.ignoreds } }"
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
                v-b-toggle="`collapse-${report.id}-item-${i}`"
                size="sm"
                variant="outline-dark"
                class="ms-lg-2 mt-2 mt-lg-0"
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
