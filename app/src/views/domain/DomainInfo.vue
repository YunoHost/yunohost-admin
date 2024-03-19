<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="view"
    skeleton="CardListSkeleton"
  >
    <!-- INFO CARD -->
    <YCard v-if="domain" :title="name" icon="globe">
      <template v-if="isMainDomain" #header-next>
        <BBadge variant="info" class="main-domain-badge">
          <ExplainWhat
            id="explain-main-domain"
            :title="$t('domain.types.main_domain')"
            :content="$t('domain.explain.main_domain', { domain: name })"
          >
            <YIcon iname="star" /> {{ $t('domain.types.main_domain') }}
          </ExplainWhat>
        </BBadge>
      </template>

      <template #header-buttons>
        <!-- DEFAULT DOMAIN -->
        <BButton
          v-if="!isMainDomain"
          @click="setAsDefaultDomain"
          variant="info"
        >
          <YIcon iname="star" /> {{ $t('set_default') }}
        </BButton>

        <!-- DELETE DOMAIN -->
        <BButton
          v-b-modal.delete-modal
          :disabled="isMainDomain"
          variant="danger"
        >
          <YIcon iname="trash-o" /> {{ $t('delete') }}
        </BButton>
      </template>

      <!-- DOMAIN LINK -->
      <DescriptionRow :term="$t('words.link')">
        <BLink :href="'https://' + name" target="_blank">
          https://{{ name }}
        </BLink>
      </DescriptionRow>

      <!-- DOMAIN CERT AUTHORITY -->
      <DescriptionRow :term="$t('domain.info.certificate_authority')">
        <YIcon :iname="cert.icon" :variant="cert.variant" class="me-1" />
        {{ $t('domain.cert.types.' + cert.authority) }}
        <span class="text-secondary px-2">
          ({{
            $t('domain.cert.valid_for', {
              days: $t('day_validity', cert.validity),
            })
          }})
        </span>
      </DescriptionRow>

      <!-- DOMAIN REGISTRAR -->
      <DescriptionRow
        v-if="domain.registrar"
        :term="$t('domain.info.registrar')"
      >
        <template v-if="domain.registrar === 'parent_domain'">
          {{ $t('domain.see_parent_domain') }}&nbsp;<BLink
            :href="`#/domains/${domain.topest_parent}/dns`"
          >
            {{ domain.topest_parent }}
          </BLink>
        </template>
        <template v-else>
          {{ domain.registrar }}
        </template>
      </DescriptionRow>

      <!-- DOMAIN APPS -->
      <DescriptionRow :term="$t('domain.info.apps_on_domain')">
        <div>
          <BButton-group
            v-for="app in domain.apps"
            :key="app.id"
            size="sm"
            class="me-2 mb-2"
          >
            <BButton
              class="py-0 fw-bold"
              variant="outline-dark"
              :to="{ name: 'app-info', params: { id: app.id } }"
            >
              {{ app.name }}
            </BButton>
            <BButton
              variant="outline-dark"
              class="py-0 px-1"
              :href="'https://' + name + app.path"
              target="_blank"
            >
              <span class="sr-only">{{ $t('app.visit_app') }}</span>
              <YIcon iname="external-link" />
            </BButton>
          </BButton-group>

          {{ domain.apps.length ? '' : $t('words.none') }}
        </div>
      </DescriptionRow>
    </YCard>

    <ConfigPanels
      v-if="config.panels"
      v-bind="config"
      :external-results="externalResults"
      @apply="onConfigSubmit"
    >
      <template v-if="currentTab === 'dns'" #tab-after>
        <DomainDns :name="name" />
      </template>
    </ConfigPanels>

    <BModal
      v-if="domain"
      id="delete-modal"
      :title="$t('confirm_delete', { name: this.name })"
      @ok="deleteDomain"
      header-bg-variant="warning"
      header-class="text-black"
      :body-class="{ 'd-none': !isMainDynDomain }"
    >
      <BFormGroup v-if="isMainDynDomain">
        <BFormCheckbox v-model="unsubscribeDomainFromDyndns">
          {{ $t('domain.info.dyn_dns_remove_and_unsubscribe') }}
        </BFormCheckbox>
      </BFormGroup>
    </BModal>
  </ViewBase>
</template>

<script>
import { mapGetters } from 'vuex'

import api, { objectToParams } from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import {
  formatFormData,
  formatYunoHostConfigPanels,
} from '@/helpers/yunohostArguments'
import ConfigPanels from '@/components/ConfigPanels.vue'
import DomainDns from './DomainDns.vue'

export default {
  name: 'DomainInfo',

  components: {
    ConfigPanels,
    DomainDns,
  },

  props: {
    name: { type: String, required: true },
  },

  setup() {
    return {
      modalConfirm: useAutoModal(),
    }
  },

  data() {
    return {
      queries: [
        ['GET', { uri: 'domains', storeKey: 'domains' }],
        [
          'GET',
          { uri: 'domains', storeKey: 'domains_details', param: this.name },
        ],
        ['GET', `domains/${this.name}/config?full`],
      ],
      config: {},
      externalResults: {},
      unsubscribeDomainFromDyndns: false,
    }
  },

  computed: {
    ...mapGetters(['mainDomain']),

    currentTab() {
      return this.$route.params.tabId
    },

    domain() {
      return this.$store.getters.domain(this.name)
    },

    parentName() {
      return this.$store.getters.highestDomainParentName(this.name)
    },

    cert() {
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

    dns() {
      return this.domain.dns
    },

    isMainDomain() {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    },

    isMainDynDomain() {
      return (
        this.domain.registrar === 'yunohost' &&
        this.name.split('.').length === 3
      )
    },
  },

  methods: {
    onQueriesResponse(domains, domain, config) {
      this.config = formatYunoHostConfigPanels(config)
    },

    async onConfigSubmit({ id, form, action, name }) {
      const args = await formatFormData(form, {
        removeEmpty: false,
        removeNull: true,
      })

      api
        .put(
          action
            ? `domain/${this.name}/actions/${action}`
            : `domains/${this.name}/config/${id}`,
          { args: objectToParams(args) },
          {
            key: `domains.${action ? 'action' : 'update'}_config`,
            id,
            name: this.name,
          },
        )
        .then(() => {
          this.$refs.view.fetchQueries({ triggerLoading: true })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          const panel = this.config.panels.find((panel) => panel.id === id)
          if (err.data.name) {
            Object.assign(this.externalResults, {
              forms: { [panel.id]: { [err.data.name]: [err.data.error] } },
            })
          } else {
            panel.serverError = err.message
          }
        })
    },

    async deleteDomain() {
      const data =
        this.isMainDynDomain && !this.unsubscribeDomainFromDyndns
          ? { ignore_dyndns: 1 }
          : {}

      api
        .delete({ uri: 'domains', param: this.name }, data, {
          key: 'domains.delete',
          name: this.name,
        })
        .then(() => {
          this.$router.push({ name: 'domain-list' })
        })
    },

    async setAsDefaultDomain() {
      const confirmed = await this.modalConfirm(
        this.$t('confirm_change_maindomain'),
      )
      if (!confirmed) return

      api
        .put(
          { uri: `domains/${this.name}/main`, storeKey: 'main_domain' },
          {},
          { key: 'domains.set_default', name: this.name },
        )
        .then(() => {
          // FIXME Have to commit by hand here since the response is empty (should return the given name)
          this.$store.commit('UPDATE_MAIN_DOMAIN', this.name)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.main-domain-badge {
  font-size: 0.75rem;
  padding-right: 0.2em;
}
</style>
