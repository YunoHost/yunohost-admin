<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse" :loading="loading"
    skeleton="card-info-skeleton"
  >
    <section v-if="showAutoConfigCard" class="panel-section">
      <b-card-title title-tag="h3">
        {{ $t('domain.dns.auto_config') }}
      </b-card-title>

      <read-only-alert-item
        :label="$t('domain.dns.info')"
        type="warning"
        icon="flask"
      />

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
      <read-only-alert-item
        v-else-if="dnsChanges === null"
        :label="$t('domain.dns.auto_config_ok')"
        type="success"
        icon="thumbs-up"
      />

      <!-- CONFIG ERROR ALERT -->
      <template v-if="dnsErrors && dnsErrors.length">
        <read-only-alert-item
          v-for="({ variant, icon, message }, i) in dnsErrors" :key="i"
          :label="message"
          :type="variant"
          :icon="icon"
        />
      </template>

      <!-- CONFIG OVERWRITE DISCLAIMER -->
      <read-only-alert-item
        v-if="force !== null"
        :label="$t('domain.dns.push_force_warning')"
        type="warning"
      />

      <!-- CONFIG PUSH SUBMIT -->
      <template v-if="dnsChanges">
        <b-form-checkbox v-if="force !== null" v-model="force">
          {{ $t('domain.dns.push_force') }}
        </b-form-checkbox>

        <b-button variant="success" @click="pushDnsChanges">
          {{ $t('domain.dns.push') }}
        </b-button>
      </template>
    </section>

    <!-- CURRENT DNS ZONE -->
    <section v-if="showAutoConfigCard && dnsZone && dnsZone.length" class="panel-section">
      <b-card-title title-tag="h3">
        {{ $t('domain.dns.auto_config_zone') }}
      </b-card-title>

      <div class="log">
        <div v-for="({ name: record, spaces, content, type }, i) in dnsZone" :key="'zone-' + i" class="records">
          {{ record }}
          <span class="bg-dark text-light px-1 rounded">{{ type }}</span>{{ spaces }}
          <span>{{ content }}</span>
        </div>
      </div>
    </section>

    <!-- MANUAL CONFIG CARD -->
    <section v-if="showManualConfigCard" class="panel-section">
      <b-card-title title-tag="h3">
        {{ $t('domain.dns.manual_config') }}
      </b-card-title>

      <read-only-alert-item
        :label="$t('domain_dns_conf_is_just_a_recommendation')"
        type="warning"
      />

      <pre class="log">{{ dnsConfig }}</pre>
    </section>
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
      showAutoConfigCard: true,
      showManualConfigCard: false,
      dnsConfig: '',
      dnsChanges: undefined,
      dnsErrors: undefined,
      dnsZone: undefined,
      force: null
    }
  },

  methods: {
    onQueriesResponse (suggestedConfig) {
      this.dnsConfig = suggestedConfig
    },

    getDnsChanges () {
      this.loading = true

      return api.post(
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
          if (records && records.length > 0) {
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

        const unchanged = dnsChanges.unchanged
        if (unchanged) {
          const longestName = getLongest(unchanged, 'name')
          const longestType = getLongest(unchanged, 'type')
          unchanged.forEach(record => {
            record.name = record.name + ' '.repeat(longestName - record.name.length + 1)
            record.spaces = ' '.repeat(longestType - record.type.length + 1)
          })
          this.dnsZone = unchanged
        }

        this.dnsChanges = changes.length > 0 ? changes : null
        this.force = canForce ? false : null
        this.loading = false
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const key = err.data.error_key
        if (key === 'domain_dns_push_managed_in_parent_domain') {
          const message = this.$t(key, err.data)
          this.dnsErrors = [{ icon: 'info', variant: 'info', message }]
        } else if (key === 'domain_dns_push_failed_to_authenticate') {
          const message = this.$t(key, err.data)
          this.dnsErrors = [{ icon: 'ban', variant: 'danger', message }]
        } else {
          this.showManualConfigCard = true
          this.showAutoConfigCard = false
        }
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
      ).then(async responseData => {
        await this.getDnsChanges()
        if (!isEmptyValue(responseData)) {
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
