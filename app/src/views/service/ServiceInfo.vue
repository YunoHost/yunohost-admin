<template>
  <view-base
    :queries="queries" @queries-response="formatServiceData"
    ref="view" skeleton="card-info-skeleton"
  >
    <!-- INFO CARD -->
    <card :title="name" icon="info-circle" button-unbreak="sm">
      <template #header-buttons>
        <template v-if="infos.status === 'running'">
          <!-- RESTART SERVICE -->
          <b-button @click="updateService('restart')" variant="warning">
            <icon iname="refresh" /> {{ $t('restart') }}
          </b-button>

          <!-- STOP SERVICE -->
          <b-button v-if="!isCritical" @click="updateService('stop')" variant="danger">
            <icon iname="warning" /> {{ $t('stop') }}
          </b-button>
        </template>

        <!-- START SERVICE -->
        <b-button v-else @click="updateService('start')" variant="success">
          <icon iname="play" /> {{ $t('start') }}
        </b-button>
      </template>

      <b-row
        v-for="(value, key) in infos" :key="key"
        no-gutters class="row-line"
      >
        <b-col md="3" xl="2">
          <strong>{{ $t(key === 'start_on_boot' ? 'service_' + key : key) }}</strong>
        </b-col>
        <b-col>
          <template v-if="key === 'status'">
            <span :class="value === 'running' ? 'text-success' : 'text-danger'">
              <icon :iname="value === 'running' ? 'check-circle' : 'times'" />
              {{ $t(value) }}
            </span>
            {{ $t('since') }} {{ uptime | distanceToNow }}
          </template>

          <span v-else-if="key === 'start_on_boot'" :class="value === 'enabled' ? 'text-success' : 'text-danger'">
            {{ $t(value) }}
          </span>

          <span v-else v-t="value" />
        </b-col>
      </b-row>
    </card>

    <!-- LOGS CARD -->
    <card :title="$t('logs')" icon="book" button-unbreak="sm">
      <template #header-buttons>
        <b-button variant="success" @click="shareLogs">
          <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </b-button>
      </template>

      <template v-for="({ filename, content }, i) in logs">
        <h3 :key="i + '-filename'">
          {{ filename }}
        </h3>

        <pre :key="i + '-content'" class="log"><code>{{ content }}</code></pre>
      </template>
    </card>
  </view-base>
</template>

<script>
import api from '@/api'
import { distanceToNow } from '@/helpers/filters/date'

export default {
  name: 'ServiceInfo',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        'services/' + this.name,
        `services/${this.name}/log?number=50`
      ],
      // Service data
      infos: undefined,
      uptime: undefined,
      isCritical: undefined,
      logs: undefined,
      // Modal action
      action: undefined
    }
  },

  methods: {
    formatServiceData (
      // eslint-disable-next-line
      { status, description, start_on_boot, last_state_change, configuration },
      logs
    ) {
      this.isCritical = ['nginx', 'ssh', 'slapd', 'yunohost-api'].includes(this.name)
      // eslint-disable-next-line
      this.uptime = last_state_change === 'unknown' ? 0 : last_state_change
      this.infos = { description, status, start_on_boot, configuration }

      this.logs = Object.keys(logs).sort((prev, curr) => {
        if (prev === 'journalctl') return -1
        else if (curr === 'journalctl') return 1
        else if (prev < curr) return -1
        else return 1
      }).map(filename => ({ content: logs[filename].join('\n'), filename }))
    },

    async updateService (action) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_service_' + action, { name: this.name })
      )
      if (!confirmed) return

      if (!['start', 'restart', 'stop'].includes(action)) return
      const method = action === 'stop' ? 'delete' : 'put'
      const uri = action === 'restart'
        ? `services/${this.name}/restart`
        : 'services/' + this.name

      // FIXME API doesn't return anything to the PUT so => json err
      api[method](uri).then(this.$refs.view.fetchQueries)
    },

    shareLogs () {
      const logs = this.logs.map(({ filename, content }) => {
        return `LOGFILE: ${filename}\n${content}`
      }).join('\n\n')

      fetch('https://paste.yunohost.org/documents', {
        method: 'POST',
        body: logs
      }).then(response => {
        if (response.ok) return response.json()
        // FIXME flash error
        else console.log('error', response)
      }).then(({ key }) => {
        window.open('https://paste.yunohost.org/' + key, '_blank')
      })
    }
  },

  filters: { distanceToNow }
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
