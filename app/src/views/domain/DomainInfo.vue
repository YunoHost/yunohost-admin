<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import api, { objectToParams } from '@/api'
import ConfigPanels from '@/components/ConfigPanels.vue'
import type ViewBase from '@/components/globals/ViewBase.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import {
  formatFormData,
  formatYunoHostConfigPanels,
} from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'
import DomainDns from '@/views/domain/DomainDns.vue'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useStore()
const modalConfirm = useAutoModal()

const viewElem = ref<InstanceType<typeof ViewBase> | null>(null)

const { mainDomain } = useStoreGetters()

const queries = [
  ['GET', { uri: 'domains', storeKey: 'domains' }],
  ['GET', { uri: 'domains', storeKey: 'domains_details', param: props.name }],
  ['GET', `domains/${props.name}/config?full`],
]
const config = ref({})
const externalResults = reactive({})
const unsubscribeDomainFromDyndns = ref(false)

const currentTab = computed(() => {
  return route.params.tabId
})

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

function onQueriesResponse(domains, domain, config_) {
  config.value = formatYunoHostConfigPanels(config_)
}

async function onConfigSubmit({ id, form, action, name }) {
  const args = await formatFormData(form, {
    removeEmpty: false,
    removeNull: true,
  })

  api
    .put(
      action
        ? `domain/${props.name}/actions/${action}`
        : `domains/${props.name}/config/${id}`,
      { args: objectToParams(args) },
      {
        key: `domains.${action ? 'action' : 'update'}_config`,
        id,
        name: props.name,
      },
    )
    .then(() => viewElem.value!.fetchQueries({ triggerLoading: true }))
    .catch((err) => {
      if (err.name !== 'APIBadRequestError') throw err
      const panel = config.value.panels.find((panel) => panel.id === id)
      if (err.data.name) {
        Object.assign(externalResults, {
          forms: { [panel.id]: { [err.data.name]: [err.data.error] } },
        })
      } else {
        panel.serverError = err.message
      }
    })
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
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="viewElem"
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
              <span class="visually-hidden">{{ $t('app.visit_app') }}</span>
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
