<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { distanceToNow } from '@/helpers/filters/date'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { loading, refetch } = useInitialQueries(
  [
    { uri: 'services/' + props.name },
    { uri: `services/${props.name}/log?number=50` },
  ],
  { onQueriesResponse },
)

const infos = ref()
const uptime = ref()
const isCritical = ref()
const logs = ref()
const action = ref()

function onQueriesResponse(
  // eslint-disable-next-line
  { status, description, start_on_boot, last_state_change, configuration }: any,
  logs_: any,
) {
  isCritical.value = ['nginx', 'ssh', 'slapd', 'yunohost-api'].includes(
    props.name,
  )
  // eslint-disable-next-line
  uptime.value = last_state_change === 'unknown' ? 0 : last_state_change
  infos.value = { description, status, start_on_boot, configuration }

  logs.value = Object.keys(logs_)
    .sort((prev, curr) => {
      if (prev === 'journalctl') return -1
      else if (curr === 'journalctl') return 1
      else if (prev < curr) return -1
      else return 1
    })
    .map((filename) => ({ content: logs_[filename].join('\n'), filename }))
}

async function updateService(action) {
  const confirmed = await modalConfirm(
    t('confirm_service_' + action, { name: props.name }),
  )
  if (!confirmed) return

  api
    .put({
      uri: `services/${props.name}/${action}`,
      humanKey: { key: 'services.' + action, name: props.name },
    })
    .then(() => refetch(false))
}

function shareLogs() {
  const logs = logs.value
    .map(({ filename, content }) => {
      return `LOGFILE: ${filename}\n${content}`
    })
    .join('\n\n')

  fetch('https://paste.yunohost.org/documents', {
    method: 'POST',
    body: logs,
  })
    .then((response) => {
      if (response.ok) return response.json()
      // FIXME flash error
      /* eslint-disable-next-line */ else console.log('error', response)
    })
    .then(({ key }) => {
      window.open('https://paste.yunohost.org/' + key, '_blank')
    })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardInfoSkeleton">
    <!-- INFO CARD -->
    <YCard :title="name" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <template v-if="infos.status === 'running'">
          <!-- RESTART SERVICE -->
          <BButton @click="updateService('restart')" variant="warning">
            <YIcon iname="refresh" /> {{ $t('restart') }}
          </BButton>

          <!-- STOP SERVICE -->
          <BButton
            v-if="!isCritical"
            @click="updateService('stop')"
            variant="danger"
          >
            <YIcon iname="warning" /> {{ $t('stop') }}
          </BButton>
        </template>

        <!-- START SERVICE -->
        <BButton v-else @click="updateService('start')" variant="success">
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
            {{ $t(key === 'start_on_boot' ? 'service_' + key : key) }}
          </strong>
        </BCol>
        <BCol>
          <template v-if="key === 'status'">
            <span :class="value === 'running' ? 'text-success' : 'text-danger'">
              <YIcon :iname="value === 'running' ? 'check-circle' : 'times'" />
              {{ $t(value) }}
            </span>
            {{ $t('since') }} {{ distanceToNow(uptime) }}
          </template>

          <span
            v-else-if="key === 'start_on_boot'"
            :class="value === 'enabled' ? 'text-success' : 'text-danger'"
          >
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
  </ViewBase>
</template>

<style lang="scss" scoped>
h3 {
  margin-bottom: 1rem;

  &:not(:first-of-type) {
    margin-top: 2rem;
  }
}
</style>
