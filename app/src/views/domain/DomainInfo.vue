<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import api, { objectToParams } from '@/api'
import ConfigPanelsComponent from '@/components/ConfigPanels.vue'
import type {
  ConfigPanelsProps,
  OnPanelApply,
} from '@/composables/configPanels'
import { formatConfigPanels, useConfigPanels } from '@/composables/configPanels'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { useStoreGetters } from '@/store/utils'
import type { CoreConfigPanels } from '@/types/core/options'
import DomainDns from '@/views/domain/DomainDns.vue'

const props = defineProps<{
  name: string
  tabId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useStore()
const modalConfirm = useAutoModal()
const { loading, refetch } = useInitialQueries(
  [
    ['GET', { uri: 'domains', storeKey: 'domains' }],
    ['GET', { uri: 'domains', storeKey: 'domains_details', param: props.name }],
    ['GET', `domains/${props.name}/config?full`],
  ],
  { onQueriesResponse },
)

const { mainDomain } = useStoreGetters()
const config = shallowRef<ConfigPanelsProps | undefined>()
const unsubscribeDomainFromDyndns = ref(false)

const domain = computed(() => {
  return store.getters.domain(props.name)
})

const parentName = computed(() => {
  return store.getters.highestDomainParentName(props.name)
})

const cert = computed(() => {
  const { CA_type: authority, validity } = domain.value.certificate
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
})

const dns = computed(() => {
  return domain.value.dns
})

const isMainDomain = computed(() => {
  if (!mainDomain.value) return
  return props.name === mainDomain.value
})

const isMainDynDomain = computed(() => {
  return (
    domain.value.registrar === 'yunohost' && props.name.split('.').length === 3
  )
})

function onQueriesResponse(
  domains: any,
  domain: any,
  config_: CoreConfigPanels,
) {
  config.value = useConfigPanels(
    formatConfigPanels(config_),
    () => props.tabId,
    onPanelApply,
  )
}

const onPanelApply: OnPanelApply = ({ panelId, data, action }, onError) => {
  api
    .put(
      action
        ? `domain/${props.name}/actions/${action}`
        : `domains/${props.name}/config/${panelId}`,
      { args: objectToParams(data) },
      {
        key: `domains.${action ? 'action' : 'update'}_config`,
        id: panelId,
        name: props.name,
      },
    )
    .then(() => refetch())
    .catch(onError)
}

async function deleteDomain() {
  const data =
    isMainDynDomain.value && !unsubscribeDomainFromDyndns.value
      ? { ignore_dyndns: 1 }
      : {}

  api
    .delete({ uri: 'domains', param: props.name }, data, {
      key: 'domains.delete',
      name: props.name,
    })
    .then(() => {
      router.push({ name: 'domain-list' })
    })
}

async function setAsDefaultDomain() {
  const confirmed = await modalConfirm(t('confirm_change_maindomain'))
  if (!confirmed) return

  api
    .put(
      { uri: `domains/${props.name}/main`, storeKey: 'main_domain' },
      {},
      { key: 'domains.set_default', name: props.name },
    )
    .then(() => {
      // FIXME Have to commit by hand here since the response is empty (should return the given name)
      store.commit('UPDATE_MAIN_DOMAIN', props.name)
    })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardListSkeleton">
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
              <span class="visually-hidden">{{ $t('app.visit_app') }}</span>
              <YIcon iname="external-link" />
            </BButton>
          </BButton-group>

          {{ domain.apps.length ? '' : $t('words.none') }}
        </div>
      </DescriptionRow>
    </YCard>

    <ConfigPanelsComponent
      v-if="config"
      v-model="config.form"
      :panel="config.panel.value"
      :validations="config.v.value"
      :routes="config.routes"
      @apply="config.onPanelApply"
    >
      <template v-if="tabId === 'dns'" #tab-after>
        <DomainDns :name="name" />
      </template>
    </ConfigPanelsComponent>

    <BModal
      v-if="domain"
      id="delete-modal"
      :title="$t('confirm_delete', { name: props.name })"
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

<style lang="scss" scoped>
.main-domain-badge {
  font-size: 0.75rem;
  padding-right: 0.2em;
}
</style>
