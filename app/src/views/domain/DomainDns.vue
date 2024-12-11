<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import type { Obj, StateVariant } from '@/types/commons'
import type { DNSCategories, DNSRecord } from '@/types/core/api'

type DNSChanges = {
  action: 'create' | 'update' | 'delete'
  icon: string
  variant: string
  records: DNSRecord[]
}
type DNSError = { icon: string; variant: StateVariant; message: string }

const props = defineProps<{
  name: string
  autoDns: boolean
}>()

const { t } = useI18n()
const modalConfirm = useAutoModal()

const dnsConfig = await api.get<string>({
  uri: `domains/${props.name}/dns/suggest`,
  initial: true,
})

const showAutoConfigCard = ref(true)
const showManualConfigCard = ref(false)
const dnsChanges = ref<DNSChanges[] | null>(null)
const dnsErrors = ref<DNSError[]>([])
const dnsZone = ref<DNSRecord[] | null>(null)
const force = ref<boolean | null>(null)

getDnsChanges()
// FIXME other Suspense? get types
function getDnsChanges() {
  return api
    .post<DNSCategories>({
      uri: `domains/${props.name}/dns/push?dry_run`,
      showModal: true,
      isAction: false,
    })
    .then((dnsCategories) => {
      let canForce = false

      function getLongest(arr: Obj[], key: string) {
        return arr.reduce((acc, obj) => {
          if (obj[key].length > acc) return obj[key].length
          return acc
        }, 0)
      }

      function addSpace(str: string, len: number, prepend: boolean = false) {
        return (prepend ? str : '') + ' '.repeat(len - str.length + 1)
      }

      function formatRecords(records?: DNSRecord[]) {
        if (!records || !records.length) return null
        const longestName = getLongest(records, 'name')
        const longestType = getLongest(records, 'type')
        return records.map((record) => {
          record.name = addSpace(record.name, longestName, true)
          record.spaces = addSpace(record.type, longestType)
          if (record.managed_by_yunohost) canForce = true
          return record
        })
      }

      const categories = [
        { action: 'create' as const, icon: 'plus', variant: 'success' },
        { action: 'update' as const, icon: 'exchange', variant: 'warning' },
        { action: 'delete' as const, icon: 'minus', variant: 'danger' },
      ]
      const changes = categories
        .map((category) => {
          const records = formatRecords(dnsCategories[category.action])
          if (!records) return null
          return { ...category, records }
        })
        .filter((dnsChange) => dnsChange !== null) as DNSChanges[]

      dnsZone.value = formatRecords(dnsCategories.unchanged)
      dnsChanges.value = changes.length > 0 ? changes : null
      force.value = changes.length && canForce ? false : null
    })
    .catch((err) => {
      if (err.name !== 'APIBadRequestError') throw err
      const key = err.data.error_key
      if (key === 'domain_dns_push_managed_in_parent_domain') {
        const message = t(key, err.data)
        dnsErrors.value = [{ icon: 'info', variant: 'info', message }]
      } else if (key === 'domain_dns_push_failed_to_authenticate') {
        const message = t(key, err.data)
        dnsErrors.value = [{ icon: 'ban', variant: 'danger', message }]
      } else if (
        key === 'domain_registrar_is_not_configured' &&
        props.autoDns
      ) {
        dnsErrors.value = [
          { icon: 'ban', variant: 'danger', message: err.data.error },
        ]
      } else {
        showManualConfigCard.value = key !== 'domain_dns_conf_special_use_tld'
        showAutoConfigCard.value = false
      }
    })
}

async function pushDnsChanges() {
  if (force.value) {
    const confirmed = await modalConfirm(t('domain.dns.push_force_confirm'))
    if (!confirmed) return
  }

  api
    .post<Obj<string[]>>({
      uri: `domains/${props.name}/dns/push${force.value ? '?force' : ''}`,
    })
    .then(async (responseData) => {
      await getDnsChanges()
      dnsErrors.value = Object.keys(responseData).reduce((acc, key) => {
        const args =
          key === 'warnings'
            ? { icon: 'warning', variant: 'warning' as const }
            : { icon: 'ban', variant: 'danger' as const }
        responseData[key].forEach((message) => acc.push({ ...args, message }))
        return acc
      }, [] as DNSError[])
    })
}
</script>

<template>
  <div>
    <section v-if="showAutoConfigCard" class="panel-section">
      <BCardTitle title-tag="h3">
        {{ $t('domain.dns.auto_config') }}
      </BCardTitle>

      <ReadOnlyAlertItem
        :label="$t('domain.dns.info')"
        type="warning"
        icon="flask"
      />

      <!-- AUTO CONFIG CHANGES -->
      <template v-if="dnsChanges">
        <div
          v-for="{ action, records, icon, variant } in dnsChanges"
          :key="icon"
          class="mb-3"
        >
          <h4 class="mt-4 mb-2">
            {{ action }}
          </h4>

          <div class="log">
            <div
              v-for="(
                {
                  name: record,
                  spaces,
                  old_content,
                  content,
                  type,
                  managed_by_yunohost,
                },
                i
              ) in records"
              :key="i"
              class="records px-2"
              :class="{
                ignored: managed_by_yunohost === false && force !== true,
              }"
              :title="
                managed_by_yunohost === false && force !== true
                  ? $t('domain.dns.auto_config_ignored')
                  : undefined
              "
            >
              <YIcon :iname="icon" :class="'text-' + variant" />
              {{ record }}
              <span class="bg-dark text-light px-1 rounded">{{ type }}</span
              >{{ spaces }}
              <span v-if="old_content"
                ><span class="text-danger">{{ old_content }}</span> -->
              </span>
              <span :class="{ 'text-success': old_content }">{{
                content
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- CONFIG OK ALERT -->
      <ReadOnlyAlertItem
        v-else-if="dnsChanges === null && !dnsErrors.length"
        :label="$t('domain.dns.auto_config_ok')"
        type="success"
        icon="thumbs-up"
      />

      <!-- CONFIG ERROR ALERT -->
      <template v-if="dnsErrors.length">
        <ReadOnlyAlertItem
          v-for="({ variant, icon, message }, i) in dnsErrors"
          :key="i"
          :label="message"
          :type="variant"
          :icon="icon"
        />
      </template>

      <!-- CONFIG OVERWRITE DISCLAIMER -->
      <ReadOnlyAlertItem
        v-if="force !== null"
        :label="$t('domain.dns.push_force_warning')"
        type="warning"
      />

      <!-- CONFIG PUSH SUBMIT -->
      <template v-if="dnsChanges">
        <BFormCheckbox v-if="force !== null" v-model="force">
          {{ $t('domain.dns.push_force') }}
        </BFormCheckbox>

        <BButton variant="success" @click="pushDnsChanges">
          {{ $t('domain.dns.push') }}
        </BButton>
      </template>
    </section>

    <!-- CURRENT DNS ZONE -->
    <section
      v-if="showAutoConfigCard && dnsZone && dnsZone.length"
      class="panel-section"
    >
      <BCardTitle title-tag="h3">
        {{ $t('domain.dns.auto_config_zone') }}
      </BCardTitle>

      <div class="log">
        <div
          v-for="({ name: record, spaces, content, type }, i) in dnsZone"
          :key="'zone-' + i"
          class="records"
        >
          {{ record }}
          <span class="bg-dark text-light px-1 rounded">{{ type }}</span
          >{{ spaces }}
          <span>{{ content }}</span>
        </div>
      </div>
    </section>

    <!-- MANUAL CONFIG CARD -->
    <section v-if="showManualConfigCard" class="panel-section">
      <BCardTitle title-tag="h3">
        {{ $t('domain.dns.manual_config') }}
      </BCardTitle>

      <ReadOnlyAlertItem
        :label="$t('domain_dns_conf_is_just_a_recommendation')"
        type="warning"
      />

      <pre class="log">{{ dnsConfig }}</pre>
    </section>
  </div>
</template>

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
