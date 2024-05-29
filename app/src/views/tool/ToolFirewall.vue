<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import type ViewBase from '@/components/globals/ViewBase.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { between, integer, required } from '@/helpers/validators'

const { t } = useI18n()
const modalConfirm = useAutoModal()

const viewElem = ref<InstanceType<typeof ViewBase> | null>(null)

const queries = [['GET', '/firewall?raw']]

const fields = [
  { key: 'port', label: t('port') },
  { key: 'ipv4', label: t('ipv4') },
  { key: 'ipv6', label: t('ipv6') },
  { key: 'uPnP', label: t('upnp') },
]
const form = reactive({
  action: 'allow',
  port: undefined,
  connection: 'ipv4',
  protocol: 'TCP',
})
const v$ = useVuelidate(
  {
    port: { number: required, integer, between: between(0, 65535) },
  },
  form,
)
const serverError = ref('')

// Ports tables data
const protocols = ref()

// Ports form data
const actionChoices = [
  { value: 'allow', text: t('open') },
  { value: 'disallow', text: t('close') },
]
const connectionChoices = [
  { value: 'ipv4', text: t('ipv4') },
  { value: 'ipv6', text: t('ipv6') },
]
const protocolChoices = [
  { value: 'TCP', text: t('tcp') },
  { value: 'UDP', text: t('udp') },
  { value: 'Both', text: t('both') },
]

// uPnP
const upnpEnabled = ref()
const upnpError = ref('')

function onQueriesResponse(data) {
  const ports = Object.values(data).reduce(
    (ports_, protocols_) => {
      for (const type of ['TCP', 'UDP']) {
        for (const port of protocols_[type]) {
          ports_[type].add(port)
        }
      }
      return ports
    },
    { TCP: new Set(), UDP: new Set() },
  )

  const tables = {
    TCP: [],
    UDP: [],
  }
  for (const protocol of ['TCP', 'UDP']) {
    for (const port of ports[protocol]) {
      const row = { port }
      for (const connection of ['ipv4', 'ipv6', 'uPnP']) {
        row[connection] = data[connection][protocol].includes(port)
      }
      tables[protocol].push(row)
    }
    tables[protocol].sort((a, b) => (a.port < b.port ? -1 : 1))
  }

  protocols.value = tables
  upnpEnabled.value = data.uPnP.enabled
}

async function togglePort({ action, port, protocol, connection }) {
  const confirmed = await modalConfirm(
    t('confirm_firewall_' + action, {
      port,
      protocol,
      connection,
    }),
  )
  if (!confirmed) {
    return Promise.resolve(confirmed)
  }

  const actionTrad = t({ allow: 'open', disallow: 'close' }[action])
  return api
    .put(
      `firewall/${protocol}/${action}/${port}?${connection}_only`,
      {},
      {
        key: 'firewall.ports',
        protocol,
        action: actionTrad,
        port,
        connection,
      },
      { wait: false },
    )
    .then(() => confirmed)
}

async function toggleUpnp(value) {
  const action = upnpEnabled.value ? 'disable' : 'enable'
  const confirmed = await modalConfirm(t('confirm_upnp_' + action))
  if (!confirmed) return

  api
    .put(
      'firewall/upnp/' + action,
      {},
      { key: 'firewall.upnp', action: t(action) },
    )
    .then(() => {
      // FIXME Couldn't test when it works.
      viewElem.value!.fetchQueries()
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      upnpError.value = err.message
    })
}

function onTablePortToggling(port, protocol, connection, index, value) {
  protocols.value[protocol][index][connection] = value
  const action = value ? 'allow' : 'disallow'
  togglePort({ action, port, protocol, connection }).then((toggled) => {
    // Revert change on cancel
    if (!toggled) {
      protocols.value[protocol][index][connection] = !value
    }
  })
}

function onFormPortToggling() {
  togglePort(form).then((toggled) => {
    if (toggled) viewElem.value!.fetchQueries()
  })
}
</script>

<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="viewElem"
    skeleton="CardFormSkeleton"
  >
    <!-- PORTS -->
    <YCard :title="$t('ports')" icon="shield">
      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>

        <BTable :fields="fields" :items="items" small striped responsive>
          <!-- PORT CELL -->
          <template #cell(port)="data">
            {{ data.value }}
          </template>

          <!-- CONNECTIONS CELL -->
          <template #cell()="data">
            <BFormCheckbox
              v-if="data.field.key !== 'uPnP'"
              :modelValue="data.value"
              switch
              @update:modelValue="
                onTablePortToggling(
                  data.item.port,
                  protocol,
                  data.field.key,
                  data.index,
                  $event,
                )
              "
            >
              <span
                :class="'btn btn-xs btn-' + (data.value ? 'danger' : 'success')"
              >
                {{ $t(data.value ? 'close' : 'open') }}
              </span>
            </BFormCheckbox>

            <YIcon
              v-else
              :iname="data.value ? 'check' : 'times'"
              :class="data.value ? 'text-success' : 'text-danger'"
            />
          </template>
        </BTable>
      </div>
    </YCard>

    <!-- OPERATIONS -->
    <CardForm
      :title="$t('operations')"
      icon="cogs"
      :validation="v$"
      :server-error="serverError"
      @submit.prevent="onFormPortToggling"
      inline
      form-classes="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-start"
    >
      <BInputGroup :prepend="$t('action')">
        <BFormSelect v-model="form.action" :options="actionChoices" />
      </BInputGroup>

      <FormField :validation="v$.form.port" class="mb-0">
        <BInputGroup :prepend="$t('port')">
          <InputItem
            id="input-port"
            placeholder="0"
            type="number"
            v-model="form.port"
          />
        </BInputGroup>
      </FormField>

      <BInputGroup :prepend="$t('connection')">
        <BFormSelect
          v-model="form.connection"
          :options="connectionChoices"
          id="input-connection"
        />
      </BInputGroup>

      <BInputGroup :prepend="$t('protocol')">
        <BFormSelect
          v-model="form.protocol"
          :options="protocolChoices"
          id="input-protocol"
        />
      </BInputGroup>
    </CardForm>

    <!-- UPnP -->
    <YCard
      :title="$t('upnp')"
      icon="exchange"
      :body-text-variant="upnpEnabled ? 'success' : 'danger'"
    >
      {{ $t(upnpEnabled ? 'upnp_enabled' : 'upnp_disabled') }}

      <BFormInvalidFeedback :state="upnpError !== '' ? false : null">
        {{ upnpError }}
      </BFormInvalidFeedback>

      <template #buttons>
        <BButton
          @click="toggleUpnp"
          :variant="!upnpEnabled ? 'success' : 'danger'"
        >
          {{ $t(!upnpEnabled ? 'enable' : 'disable') }}
        </BButton>
      </template>
    </YCard>
  </ViewBase>
</template>

<style lang="scss" scoped>
:deep() {
  .form-switch {
    .form-check-input {
      --bs-form-switch-bg: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='rgb(255, 255, 255)'/></svg>") !important;
      [data-bs-theme='dark'] * & {
        --bs-form-switch-bg: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='rgb(34, 38, 42)'/></svg>") !important;
      }
      &:checked {
        border-color: $success;
        background-color: $success;
      }
      &:not(:checked) {
        border-color: $danger;
        background-color: $danger;
      }
    }

    input:focus ~ .custom-control-label,
    &:hover {
      span {
        visibility: visible;
      }
    }
    span {
      visibility: hidden;
      @include media-breakpoint-down(sm) {
        display: none;
      }
    }
  }
}
</style>
