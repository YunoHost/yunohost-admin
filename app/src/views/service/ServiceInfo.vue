<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="view"
    skeleton="CardInfoSkeleton"
  >
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

<script>
import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'

export default {
  compatConfig: { MODE: 3 },
  name: 'ServiceInfo',

  props: {
    name: { type: String, required: true },
  },

  data() {
    return {
      queries: [
        ['GET', 'services/' + this.name],
        ['GET', `services/${this.name}/log?number=50`],
      ],
      // Service data
      infos: undefined,
      uptime: undefined,
      isCritical: undefined,
      logs: undefined,
      // Modal action
      action: undefined,
    }
  },

  methods: {
    onQueriesResponse(
      // eslint-disable-next-line
      { status, description, start_on_boot, last_state_change, configuration },
      logs,
    ) {
      this.isCritical = ['nginx', 'ssh', 'slapd', 'yunohost-api'].includes(
        this.name,
      )
      // eslint-disable-next-line
      this.uptime = last_state_change === 'unknown' ? 0 : last_state_change
      this.infos = { description, status, start_on_boot, configuration }

      this.logs = Object.keys(logs)
        .sort((prev, curr) => {
          if (prev === 'journalctl') return -1
          else if (curr === 'journalctl') return 1
          else if (prev < curr) return -1
          else return 1
        })
        .map((filename) => ({ content: logs[filename].join('\n'), filename }))
    },

    async updateService(action) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_service_' + action, { name: this.name }),
      )
      if (!confirmed) return

      api
        .put(
          `services/${this.name}/${action}`,
          {},
          { key: 'services.' + action, name: this.name },
        )
        .then(this.$refs.view.fetchQueries)
    },

    shareLogs() {
      const logs = this.logs
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
    },

    distanceToNow,
  },
}
</script>

<style lang="scss" scoped>
h3 {
  margin-bottom: 1rem;

  &:not(:first-of-type) {
    margin-top: 2rem;
  }
}
</style>
