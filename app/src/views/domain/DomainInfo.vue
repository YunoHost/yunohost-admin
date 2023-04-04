<template>
  <view-base
    :queries="queries" @queries-response="onQueriesResponse"
    ref="view" skeleton="card-list-skeleton"
  >
    <!-- INFO CARD -->
    <card v-if="domain" :title="name" icon="globe">
      <template v-if="isMainDomain" #header-next>
        <b-badge variant="info" class="main-domain-badge">
          <explain-what
            id="explain-main-domain"
            :title="$t('domain.types.main_domain')"
            :content="$t('domain.explain.main_domain', { domain: name })"
          >
            <icon iname="star" /> {{ $t('domain.types.main_domain') }}
          </explain-what>
        </b-badge>
      </template>

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

      <!-- DOMAIN CERT AUTHORITY -->
      <description-row :term="$t('domain.info.certificate_authority')">
        <icon :iname="cert.icon" :variant="cert.variant" class="mr-1" />
        {{ $t('domain.cert.types.' + cert.authority) }}
        <span class="text-secondary px-2">({{ $t('domain.cert.valid_for', { days: $tc('day_validity', cert.validity) }) }})</span>
      </description-row>

      <!-- DOMAIN REGISTRAR -->
      <description-row v-if="domain.registrar" :term="$t('domain.info.registrar')">
        <template v-if="domain.registrar === 'parent_domain'">
          {{ $t('domain.see_parent_domain') }}&nbsp;<b-link :href="`#/domains/${domain.topest_parent}/dns`">
            {{ domain.topest_parent }}
          </b-link>
        </template>
        <template v-else>
          {{ domain.registrar }}
        </template>
      </description-row>

      <!-- DOMAIN APPS -->
      <description-row :term="$t('domain.info.apps_on_domain')">
        <div>
          <b-button-group
            v-for="app in domain.apps" :key="app.id"
            size="sm" class="mr-2 mb-2"
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

          {{ domain.apps.length ? '' : $t('words.none') }}
        </div>
      </description-row>
    </card>

    <config-panels v-if="config.panels" v-bind="config" @submit="onConfigSubmit">
      <template v-if="currentTab === 'dns'" #tab-after>
        <domain-dns :name="name" />
      </template>
    </config-panels>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'

import api, { objectToParams } from '@/api'
import {
  formatFormData,
  formatYunoHostConfigPanels
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels.vue'
import DomainDns from './DomainDns.vue'


export default {
  name: 'DomainInfo',

  components: {
    ConfigPanels,
    DomainDns
  },

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', { uri: 'domains', storeKey: 'domains' }],
        ['GET', { uri: 'domains', storeKey: 'domains_details', param: this.name }],
        ['GET', `domains/${this.name}/config?full`]
      ],
      config: {}
    }
  },

  computed: {
    ...mapGetters(['mainDomain']),

    currentTab () {
      return this.$route.params.tabId
    },

    domain () {
      return this.$store.getters.domain(this.name)
    },

    parentName () {
      return this.$store.getters.highestDomainParentName(this.name)
    },

    cert () {
      const { CA_type: authority, validity } = this.domain.certificate
      const baseInfos = { authority, validity }
      if (validity <= 0) {
        return { icon: 'times', variant: 'danger', ...baseInfos }
      } else if (authority === 'other') {
        return validity < 15
          ? { icon: 'exclamation', variant: 'danger', ...baseInfos }
          : { icon: 'check', variant: 'success', ...baseInfos }
      } else if (authority === 'letsencrypt') {
        return { icon: 'thumbs-up', variant: 'success', ...baseInfos }
      }
      return { icon: 'exclamation', variant: 'warning', ...baseInfos }
    },

    dns () {
      return this.domain.dns
    },

    isMainDomain () {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    }
  },

  methods: {
    onQueriesResponse (domains, domain, config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async onConfigSubmit ({ id, form, action, name }) {
      const args = await formatFormData(form, { removeEmpty: false, removeNull: true })

      api.put(
        action
          ? `domain/${this.name}/actions/${action}`
          : `domains/${this.name}/config/${id}`,
        { args: objectToParams(args) },
        { key: `domains.${action ? 'action' : 'update'}_config`, id, name: this.name }
      ).then(() => {
        this.$refs.view.fetchQueries({ triggerLoading: true })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        const panel = this.config.panels.find(panel => panel.id === id)
        if (err.data.name) {
          this.config.errors[id][err.data.name].message = err.message
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

<style lang="scss" scoped>
.main-domain-badge {
  font-size: .75rem;
  padding-right: .2em;
}
</style>
