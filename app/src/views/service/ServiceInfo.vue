<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { distanceToNow } from '@/helpers/filters/date'
import type { ServiceInfo, ServiceLogs } from '@/types/core/api'

const props = defineProps<{ name: string }>()

const { t } = useI18n()
const modalConfirm = useAutoModal()

const { infos, upOrDownTime, isCritical, logs } = await api
  .fetchAll<
    [ServiceInfo, ServiceLogs]
  >([{ uri: 'services/' + props.name }, { uri: `services/${props.name}/log?number=50` }])
  .then(([service, logs]) => {
    const { last_state_change, ...infos } = service
    const criticalServices = ['nginx', 'ssh', 'slapd', 'yunohost-api']

    return {
      infos,
      upOrDownTime:
        last_state_change === 'unknown'
          ? t('unknown')
          : distanceToNow(last_state_change, false),
      isCritical: criticalServices.includes(props.name),
      logs: Object.keys(logs)
        .sort((prev, curr) => {
          if (prev === 'journalctl') return -1
          else if (curr === 'journalctl') return 1
          else if (prev < curr) return -1
          else return 1
        })
        .map((filename) => ({
          content: logs[filename].join('\n'),
          filename,
        })),
    }
  })

async function updateService(action: 'start' | 'stop' | 'restart') {
  /*
  i18n: confirm_service_start
  i18n: confirm_service_stop
  i18n: confirm_service_restart
  */
  const confirmed = await modalConfirm(
    t(`confirm_service_${action}`, { name: props.name }),
  )
  if (!confirmed) return

  api.put({ uri: `services/${props.name}/${action}` }).then(() => api.refetch())
}

function shareLogs() {
  const logsContent = logs
    .map(({ filename, content }) => {
      return `LOGFILE: ${filename}\n${content}`
    })
    .join('\n\n')

  fetch('https://paste.yunohost.org/documents', {
    method: 'POST',
    body: logsContent,
  })
    .then((response) => {
      if (response.ok) return response.json()
      else console.error('error', response)
      // FIXME flash error
    })
    .then(({ key }) => {
      window.open(`https://paste.yunohost.org/${key}`, '_blank')
    })
}
</script>

<template>
  <div>
    <!-- INFO CARD -->
    <YCard :title="name" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <template v-if="infos.status === 'running'">
          <!-- RESTART SERVICE -->
          <BButton variant="warning" @click="updateService('restart')">
            <YIcon iname="refresh" /> {{ $t('restart') }}
          </BButton>

          <!-- STOP SERVICE -->
          <BButton
            v-if="!isCritical"
            variant="danger"
            @click="updateService('stop')"
          >
            <YIcon iname="warning" /> {{ $t('stop') }}
          </BButton>
        </template>

        <!-- START SERVICE -->
        <BButton v-else variant="success" @click="updateService('start')">
          <YIcon iname="play" /> {{ $t('start') }}
        </BButton>
      </template>

      <BRow
        v-for="(value, key) in infos"
        :key="key"
        no-gutters
        class="row-line"
      >
        <BCol md="3" xl="2">
          <strong>
            <!--
              i18n: service_start_on_boot
              i18n: configuration
              i18n: status
              i18n: description
              -->
            {{ $t(key === 'start_on_boot' ? 'service_' + key : key) }}
          </strong>
        </BCol>
        <BCol>
          <template v-if="key === 'status'">
            <span :class="value === 'running' ? 'text-success' : 'text-danger'">
              <YIcon :iname="value === 'running' ? 'check-circle' : 'times'" />
              <!--
              i18n: running
              i18n: stopped
              i18n: failed
              i18n: unknown
              -->
              {{ $t(value) }}
            </span>
            {{ $t('since') }} {{ upOrDownTime }}
          </template>

          <span
            v-else-if="key === 'start_on_boot'"
            :class="value === 'enabled' ? 'text-success' : 'text-danger'"
          >
            <!--
              i18n: enabled
              i18n: disabled
              i18n: unknown
              -->
            {{ $t(value) }}
          </span>

          <span v-else v-t="value" />
        </BCol>
      </BRow>
    </YCard>

    <!-- LOGS CARD -->
    <YCard :title="$t('logs')" icon="book" button-unbreak="sm">
      <template #header-buttons>
        <BButton variant="success" @click="shareLogs">
          <YIcon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </BButton>
      </template>

      <template v-for="{ filename, content } in logs" :key="filename">
        <h3>
          {{ filename }}
        </h3>

        <pre class="log"><code>{{ content }}</code></pre>
      </template>
    </YCard>
  </div>
</template>

<style lang="scss" scoped>
h3 {
  margin-bottom: 1rem;

  &:not(:first-of-type) {
    margin-top: 2rem;
  }
}
</style>
