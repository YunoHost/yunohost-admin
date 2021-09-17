<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse" :loading="loading"
    skeleton="card-info-skeleton"
  >
    <card :title="$t('domain.dns.auto_config')" icon="wrench">
      <b-alert variant="warning">
        <icon iname="flask" /> <icon iname="warning" /> <span v-html="$t('domain.dns.info')" />
      </b-alert>

      <!-- AUTO CONFIG CHANGES -->
      <template v-if="dnsChanges">
        <div class="mb-3" v-for="{ action, records, icon, variant} in dnsChanges" :key="icon">
          <h4 class="mt-4 mb-2">
            {{ action }}
          </h4>

          <div class="log">
            <div
              v-for="({ name: record, spaces, old_content, content, type, managed_by_yunohost }, i) in records" :key="i"
              class="records px-2" :class="{ 'ignored': managed_by_yunohost === false && force !== true }"
              :title="managed_by_yunohost === false && force !== true ? $t('domain.dns.auto_config_ignored') : null"
            >
              <icon :iname="icon" :class="'text-' + variant" />
              {{ record }}
              <span class="bg-dark text-light px-1 rounded">{{ type }}</span>{{ spaces }}
              <span v-if="old_content"><span class="text-danger">{{ old_content }}</span> --> </span>
              <span :class="{ 'text-success': old_content }">{{ content }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- CONFIG OK ALERT -->
      <b-alert v-else-if="dnsChanges === null" variant="success" class="m-0">
        <icon iname="thumbs-up" /> {{ $t('domain.dns.auto_config_ok') }}
      </b-alert>

      <!-- CONFIG ERROR ALERT -->
      <template v-if="dnsErrors && dnsErrors.length">
        <b-alert
          v-for="({ variant, icon, message }, i) in dnsErrors" :key="i"
          :variant="variant" :class="dnsErrors.length === 1 ? 'm-0' : ''"
        >
          <icon :iname="icon" /> <span v-html="message" />
        </b-alert>
      </template>

      <!-- CONFIG OVERWRITE DISCLAIMER -->
      <b-alert v-if="force !== null" variant="warning">
        <icon iname="warning" /> <span v-html="$t('domain.dns.push_force_warning')" />
      </b-alert>

      <!-- CONFIG PUSH SUBMIT -->
      <template v-if="dnsChanges" #buttons>
        <b-form-checkbox v-if="force !== null" v-model="force">
          {{ $t('domain.dns.push_force') }}
        </b-form-checkbox>

        <b-button variant="success" @click="pushDnsChanges">
          {{ $t('domain.dns.push') }}
        </b-button>
      </template>
    </card>

    <!-- MANUAL CONFIG CARD -->
    <card :title="$t('domain.dns.manual_config')" icon="globe" no-body>
      <b-alert variant="warning" class="m-0">
        <icon iname="warning" /> {{ $t('domain_dns_conf_is_just_a_recommendation') }}
      </b-alert>

      <pre class="log">{{ dnsConfig }}</pre>
    </card>
  </view-base>
</template>

<script>
import api from '@/api'
import { isEmptyValue } from '@/helpers/commons'

export default {
  name: 'DomainDns',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', `domains/${this.name}/dns/suggest`]
      ],
      loading: true,
      dnsConfig: '',
      dnsChanges: undefined,
      dnsErrors: undefined,
      force: null
    }
  },

  methods: {
    onQueriesResponse (suggestedConfig) {
      this.dnsConfig = suggestedConfig
    },

    getDnsChanges () {
      api.post(
        `domains/${this.name}/dns/push?dry_run`, {}, null, { wait: false, websocket: false }
      ).then(dnsChanges => {
        function getLongest (arr, key) {
          return arr.reduce((acc, obj) => {
            if (obj[key].length > acc) return obj[key].length
            return acc
          }, 0)
        }

        const changes = []
        let canForce = false
        const categories = [
          { action: 'create', icon: 'plus', variant: 'success' },
          { action: 'update', icon: 'exchange', variant: 'warning' },
          { action: 'delete', icon: 'minus', variant: 'danger' }
        ]
        categories.forEach(category => {
          const records = dnsChanges[category.action]
          if (records.length > 0) {
            const longestName = getLongest(records, 'name')
            const longestType = getLongest(records, 'type')
            records.forEach(record => {
              record.name = record.name + ' '.repeat(longestName - record.name.length + 1)
              record.spaces = ' '.repeat(longestType - record.type.length + 1)
              if (record.managed_by_yunohost === false) canForce = true
            })
            changes.push({ ...category, records })
          }
        })

        this.dnsChanges = changes.length > 0 ? changes : null
        this.force = canForce ? false : null
        this.loading = false
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        let message = this.$t(err.data.error_key, err.data)
        message = message !== err.data.error_key ? message : err.message
        this.dnsErrors = [{ icon: 'ban', variant: 'danger', message }]
        this.loading = false
      })
    },

    async pushDnsChanges () {
      if (this.force) {
        const confirmed = await this.$askConfirmation(this.$i18n.t('domain.dns.push_force_confirm'))
        if (!confirmed) return
      }

      api.post(
        `domains/${this.name}/dns/push${this.force ? '?force' : ''}`,
        {},
        { key: 'domains.push_dns_changes', name: this.name }
      ).then(responseData => {
        if (isEmptyValue(responseData)) {
          this.dnsChanges = null
        } else {
          this.loading = true
          this.getDnsChanges()
          this.dnsErrors = Object.keys(responseData).reduce((acc, key) => {
            const args = key === 'warnings'
              ? { icon: 'warning', variant: 'warning' }
              : { icon: 'ban', variant: 'danger' }
            responseData[key].forEach(message => acc.push({ ...args, message }))
            return acc
          }, [])
        }
      })
    }
  },

  created () {
    this.getDnsChanges()
  }
}
</script>

<style lang="scss" scoped>
.records {
  white-space: pre;
  font-family: $font-family-monospace;

  &.ignored {
    opacity: 0.3;
    text-decoration: line-through;
  }
}
</style>
