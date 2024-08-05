<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue } from '@/helpers/commons'
import { useInitialQueries } from '@/composables/useInitialQueries'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { loading } = useInitialQueries(
  [{ uri: `domains/${props.name}/dns/suggest` }],
  { onQueriesResponse },
)

const showAutoConfigCard = ref(true)
const showManualConfigCard = ref(false)
const dnsConfig = ref('')
const dnsChanges = ref(undefined)
const dnsErrors = ref(undefined)
const dnsZone = ref(undefined)
const force = ref(null)

getDnsChanges()

function onQueriesResponse(suggestedConfig: any) {
  dnsConfig.value = suggestedConfig
}

function getDnsChanges() {
  loading.value = true

  return api
    .post({
      uri: `domains/${props.name}/dns/push?dry_run`,
      showModal: false,
      websocket: false,
    })
    .then((dnsChanges) => {
      function getLongest(arr, key) {
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
        { action: 'delete', icon: 'minus', variant: 'danger' },
      ]
      categories.forEach((category) => {
        const records = dnsChanges[category.action]
        if (records && records.length > 0) {
          const longestName = getLongest(records, 'name')
          const longestType = getLongest(records, 'type')
          records.forEach((record) => {
            record.name =
              record.name + ' '.repeat(longestName - record.name.length + 1)
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
        unchanged.forEach((record) => {
          record.name =
            record.name + ' '.repeat(longestName - record.name.length + 1)
          record.spaces = ' '.repeat(longestType - record.type.length + 1)
        })
        dnsZone.value = unchanged
      }

      dnsChanges.value = changes.length > 0 ? changes : null
      force.value = canForce ? false : null
      loading.value = false
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
      } else {
        showManualConfigCard.value = true
        showAutoConfigCard.value = false
      }
      loading.value = false
    })
}

async function pushDnsChanges() {
  if (force.value) {
    const confirmed = await modalConfirm(t('domain.dns.push_force_confirm'))
    if (!confirmed) return
  }

  api
    .post({
      uri: `domains/${props.name}/dns/push${force.value ? '?force' : ''}`,
      humanKey: { key: 'domains.push_dns_changes', name: props.name },
    })
    .then(async (responseData) => {
      await getDnsChanges()
      if (!isEmptyValue(responseData)) {
        dnsErrors.value = Object.keys(responseData).reduce((acc, key) => {
          const args =
            key === 'warnings'
              ? { icon: 'warning', variant: 'warning' }
              : { icon: 'ban', variant: 'danger' }
          responseData[key].forEach((message) => acc.push({ ...args, message }))
          return acc
        }, [])
      }
    })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardInfoSkeleton">
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
          class="mb-3"
          v-for="{ action, records, icon, variant } in dnsChanges"
          :key="icon"
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
                  : null
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
        v-else-if="dnsChanges === null"
        :label="$t('domain.dns.auto_config_ok')"
        type="success"
        icon="thumbs-up"
      />

      <!-- CONFIG ERROR ALERT -->
      <template v-if="dnsErrors && dnsErrors.length">
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
  </ViewBase>
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
