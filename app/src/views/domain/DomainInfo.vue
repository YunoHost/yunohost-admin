<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" skeleton="card-list-skeleton">
    <!-- INFO CARD -->
    <card v-if="domain" :title="name" icon="globe">
      <template #header-buttons>
        <!-- DEFAULT DOMAIN -->
        <b-button v-if="!isMainDomain" @click="setAsDefaultDomain" variant="info">
          <icon iname="star" /> {{ $t('set_default') }}
        </b-button>

        <!-- DELETE DOMAIN -->
        <b-button @click="deleteDomain" :disabled="isMainDomain" variant="danger">
          <icon iname="trash-o" /> {{ $t('delete') }}
        </b-button>
      </template>

      <!-- DOMAIN LINK -->
      <description-row :term="$t('words.link')">
        <b-link :href="'https://' + name" target="_blank">
          https://{{ name }}
        </b-link>
      </description-row>

      <!-- DOMAIN TYPE -->
      <description-row
        :term="$t('domain.info.domain_type')"
      >
        <span v-if="isMainDomain">
          <icon iname="star" />
          <explain-what
            id="explain-main-domain"
            :title="$t('domain.types.main_domain')"
            :content="$t('domain.explain.main_domain', { domain: name })"
          >{{ $t('domain.types.main_domain') }}</explain-what>
          ,&nbsp;
        </span>
        {{ $t('domain.types.' + (parentName ? 'subdomain' : 'parent_domain' )) }}
      </description-row>

      <!-- DOMAIN CERT AUTHORITY -->
      <description-row :term="$t('domain.info.certificate_authority')">
        <icon :iname="cert.status.icon" :variant="cert.status.variant" class="mr-1" />
        {{ $t('domain.cert.types.' + cert.authority) }}
        ({{ $t('domain.cert.valid_for', { days: $tc('day_validity', cert.validity) }) }})
      </description-row>

      <!-- DOMAIN DNS METHOD -->
      <description-row v-if="dns" :term="$t('domain.info.dns_config_method')">
        {{ $t('domain.dns.methods.' + dns.method) }}

        <template v-if="dns.method === 'semi_auto'">
          (<icon :iname="semiAuto.icon" :variant="semiAuto.variant" class="mr-1" />
          {{ $t('domain.dns.semi_auto_status.' + dns.semi_auto_status) }})
        </template>

        <template v-else-if="dns.method === 'handled_in_parent'">
          <b-button
            variant="outline-dark" size="xs" class="py-0 ml-1"
            :to="{ name: 'domain-info', params: { name: parentName }}"
          >
            {{ parentName }}
          </b-button>
        </template>
      </description-row>

      <!-- DOMAIN SEMI-AUTO OPTIONAL FEATURE STATUS -->
      <description-row
        v-if="!['semi_auto', 'auto', 'handled_in_parent', 'none'].includes(dns.method)"
        :term="$t('domain.info.dns_semi_auto_config_feature')"
      >
        <icon :iname="semiAuto.icon" :variant="semiAuto.variant" class="mr-1" />
        {{ $t('domain.dns.semi_auto_status.' + dns.semi_auto_status) }}
      </description-row>

      <!-- DOMAIN REGISTRAR -->
      <description-row v-if="dns.registrar" :term="$t('domain.info.registrar')" :details="dns.registrar" />

      <!-- DOMAIN APPS -->
      <description-row :term="$t('domain.info.apps_on_domain')">
        <b-button-group
          v-for="app in domain.apps" :key="app.id"
          size="sm" class="mr-2"
        >
          <b-button class="py-0 font-weight-bold" variant="outline-dark" :to="{ name: 'app-info', params: { id: app.id }}">
            {{ app.name }}
          </b-button>
          <b-button
            variant="outline-dark" class="py-0 px-1"
            :href="'https://' + name + app.path" target="_blank"
          >
            <span class="sr-only">{{ $t('app.visit_app') }}</span>
            <icon iname="external-link" />
          </b-button>
        </b-button-group>

        {{ domain.apps ? '' : $t('words.none') }}
      </description-row>
    </card>

    <config-panels v-if="config.panels" v-bind="config" @submit="applyConfig" />
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'

import api, { objectToParams } from '@/api'
import {
  formatFormData,
  formatYunoHostConfigPanels
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels'


export default {
  name: 'DomainInfo',

  components: {
    ConfigPanels
  },

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', { uri: 'domains', storeKey: 'domains' }],
        ['GET', { uri: 'domains/main', storeKey: 'main_domain' }],
        ['GET', { uri: 'domains', storeKey: 'domains_details', param: this.name }],
        ['GET', `domains/${this.name}/config?full`]
      ],
      config: {}
    }
  },

  computed: {
    ...mapGetters(['mainDomain']),

    domain () {
      return this.$store.getters.domain(this.name)
    },

    parentName () {
      return this.$store.getters.highestDomainParentName(this.name)
    },

    certStatus () {
      const cert = this.domain.certificate
      const trad = (cert.validity < 15 ? 'renew.' : '') + cert.authority
      if (cert.validity <= 0) {
        return { trad: 'invalid', icon: 'times', variant: 'danger' }
      } else if (cert.authority === 'other-unknown') {
        return cert.validity < 15
          ? { trad, icon: 'exclamation', variant: 'danger' }
          : { trad, icon: 'check', variant: 'success' }
      } else if (cert.authority === 'lets-encrypt') {
        return { trad, icon: 'thumbs-up', variant: 'success' }
      }
      return { trad, icon: 'exclamation', variant: 'warning' }
    },

    cert () {
      return {
        ...this.domain.certificate,
        status: this.certStatus
      }
    },

    dns () {
      return this.domain.dns
    },

    isMainDomain () {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    },

    semiAuto () {
      const status = this.dns.semi_auto_status
      if (!status) return
      if (status === 'unavailable') return { icon: 'times', variant: 'danger' }
      if (status === 'activable') return { icon: 'check', variant: 'info' }
      if (status === 'activated') return { icon: 'check', variant: 'success' }
      // FIXME mutate status on push --dry_run (misconfigured + has_diff)
      if (status === 'has_changes') return { icon: 'wrench', variant: 'warning' }
      if (status === 'misconfigured') return { icon: 'times', variant: 'danger' }
      return undefined
    }
  },

  methods: {
    onQueriesResponse (domains, mainDomain, domain, config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async applyConfig (id_) {
      const formatedData = await formatFormData(
        this.config.forms[id_],
        { removeEmpty: false, removeNull: true, multipart: false }
      )

      api.put(
        `domains/${this.name}/config`,
        { key: id_, args: objectToParams(formatedData) },
        { key: 'domains.update_config', name: this.name }
      ).then(() => {
        this.$refs.view.fetchQueries({ triggerLoading: true })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.config.panels.find(({ id }) => id_ === id)
        if (err.data.name) {
          this.config.errors[id_][err.data.name].message = err.message
        } else this.$set(panel, 'serverError', err.message)
      })
    },

    async deleteDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name: this.name }))
      if (!confirmed) return

      api.delete(
        { uri: 'domains', param: this.name }, {}, { key: 'domains.delete', name: this.name }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      })
    },

    async setAsDefaultDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_change_maindomain'))
      if (!confirmed) return

      api.put(
        { uri: `domains/${this.name}/main`, storeKey: 'main_domain' },
        {},
        { key: 'domains.set_default', name: this.name }
      ).then(() => {
        // FIXME Have to commit by hand here since the response is empty (should return the given name)
        this.$store.commit('UPDATE_MAIN_DOMAIN', this.name)
      })
    }
  }
}
</script>
