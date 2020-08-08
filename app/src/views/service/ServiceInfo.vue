<template>
  <div class="service-info">
    <div class="actions">
      <div class="buttons ml-auto">
        <template v-if="status === 'running'">
          <b-button
            variant="warning"
            @click="action = 'restart'" v-b-modal.action-confirm-modal
          >
            <icon iname="refresh" /> {{ $t('restart') }}
          </b-button>
          <b-button
            variant="danger"
            @click="action = 'stop'" v-b-modal.action-confirm-modal
          >
            <icon iname="warning" /> {{ $t('stop') }}
          </b-button>
        </template>
        <template v-else>
          <b-button
            variant="success"
            @click="action = 'start'" v-b-modal.action-confirm-modal
          >
            <icon iname="play" /> {{ $t('start') }}
          </b-button>
        </template>
        <b-button @click="shareLogs">
          <icon iname="cloud-upload" /> {{ $t('logs_share_with_yunopaste') }}
        </b-button>
      </div>
    </div>

    <b-card class="mb-3">
      <template v-slot:header>
        <h2><icon iname="info-circle" /> {{ name }}</h2>
      </template>

      <dl>
        <dt v-t="'description'" />
        <dd>{{ description }}</dd>
        <hr>

        <dt v-t="'status'" />
        <dd>
          <span :class="status === 'running' ? 'text-success' : 'text-danger'">
            <icon :iname="status === 'running' ? 'check-circle' : 'times'" />
            {{ status }}
          </span>
          <!-- FIXME format date to: (now - date) as words -->
          {{ $t('since') }} {{ last_state_change }}
        </dd>
        <hr>

        <dt v-t="'service_start_on_boot'" />
        <dd :class="start_on_boot === 'enabled' ? 'text-success' : 'text-danger'">
          {{ $t(start_on_boot) }}
        </dd>
        <hr>

        <dt v-t="'configuration'" />
        <dd :class="{ 'text-success': configuration === 'valid', 'text-danger': configuration === 'broken' }">
          {{ $t(configuration) }}
        </dd>
      </dl>
    </b-card>

    <b-card>
      <template v-slot:header>
        <h2><icon iname="book" /> {{ $t('logs') }}</h2>
      </template>
      <div class="w-100" v-for="{ filename, content} in logs" :key="filename">
        <h3>{{ filename }}</h3>
        <pre class="bg-light p-3"><code>{{ content }}</code></pre>
      </div>
    </b-card>

    <!-- ACTIONS CONFIRMATION MODAL -->
    <b-modal
      v-if="action"
      id="action-confirm-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="updateService" hide-header
    >
      {{ $t(`confirm_service_${action}`, { name }) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/helpers/api'

export default {
  name: 'ServiceInfo',

  props: {
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      // Service data
      status: undefined,
      description: '',
      configuration: '',
      last_state_change: 0,
      start_on_boot: undefined,
      logs: undefined,
      // Modal action
      action: undefined
    }
  },

  computed: {
  },

  methods: {
    fetchData () {
      // simply use the api helper since we will not store the request's result.
      api.getAll([
        'services/' + this.name,
        `services/${this.name}/log?number=50`
      ]).then(([service, logs]) => {
        if (service.last_state_change === 'unknown') {
          service.last_state_change = 0
        }
        for (const key in service) {
          this[key] = service[key]
        }
        this.logs = Object.keys(logs).sort((prev, curr) => {
          if (prev === 'journalctl') return -1
          else if (curr === 'journalctl') return 1
          else if (prev < curr) return -1
          else return 1
        }).map(filename => ({ content: logs[filename].join('\n'), filename }))
      })
    },

    updateService () {
      if (!['start', 'restart', 'stop'].includes(this.action)) return
      const method = this.action === 'stop' ? 'delete' : 'put'
      const uri = this.action === 'restart'
        ? `services/${this.name}/restart`
        : 'services/' + this.name

      api[method](uri).catch(() => {
        // FIXME API doesn't return anything to the PUT so => json err
      }).finally(() => {
        this.fetchData()
      })
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

  created () {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
</style>
