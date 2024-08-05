<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { toEntries } from '@/helpers/commons'
import { between, integer, required } from '@/helpers/validators'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { loading, refetch } = useInitialQueries([{ uri: '/firewall?raw' }], {
  onQueriesResponse,
})

type Form = {
  action: 'allow' | 'disallow'
  port: string | number
  connection: 'ipv4' | 'ipv6'
  protocol: 'TCP' | 'UDP' | 'Both'
}
const form = ref<Form>({
  action: 'allow',
  port: '',
  connection: 'ipv4',
  protocol: 'TCP',
})
const fields = {
  action: {
    asInputGroup: true,
    component: 'SelectItem',
    label: t('action'),
    rules: { required },
    props: {
      id: 'input-action',
      choices: [
        { value: 'allow', text: t('open') },
        { value: 'disallow', text: t('close') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['port']>,

  port: {
    asInputGroup: true,
    component: 'InputItem',
    label: t('port'),
    rules: { number: required, integer, between: between(0, 65535) },
    props: { id: 'input-port', placeholder: '0', type: 'number' },
  } satisfies FieldProps<'InputItem', Form['action']>,

  connection: {
    asInputGroup: true,
    component: 'SelectItem',
    label: t('connection'),
    rules: { required },
    props: {
      id: 'input-connection',
      choices: [
        { value: 'ipv4', text: t('ipv4') },
        { value: 'ipv6', text: t('ipv6') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['connection']>,

  protocol: {
    asInputGroup: true,
    component: 'SelectItem',
    label: t('protocol'),
    rules: { required },
    props: {
      id: 'input-protocol',
      choices: [
        { value: 'TCP', text: t('tcp') },
        { value: 'UDP', text: t('udp') },
        { value: 'Both', text: t('both') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['protocol']>,
} satisfies FormFieldDict<Form>

const { v } = useForm(form, fields)

// Ports tables data
const protocols = ref()
const protocolsFields = toEntries(fields).map(([key, { label }]) => ({
  key,
  label,
}))

// uPnP
const upnpEnabled = ref()
const upnpError = ref('')

function onQueriesResponse(data: any) {
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
    .put({
      uri: `firewall/${protocol}/${action}/${port}?${connection}_only`,
      humanKey: {
        key: 'firewall.ports',
        protocol,
        action: actionTrad,
        port,
        connection,
      },
      showModal: false,
    })
    .then(() => confirmed)
}

async function toggleUpnp(value) {
  const action = upnpEnabled.value ? 'disable' : 'enable'
  const confirmed = await modalConfirm(t('confirm_upnp_' + action))
  if (!confirmed) return

  api
    .put({
      uri: 'firewall/upnp/' + action,
      humanKey: { key: 'firewall.upnp', action: t(action) },
    })
    .then(() => {
      // FIXME Couldn't test when it works.
      refetch(false)
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
    if (toggled) refetch(false)
  })
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardFormSkeleton">
    <!-- PORTS -->
    <YCard :title="$t('ports')" icon="shield">
      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>

        <BTable
          :fields="protocolsFields"
          :items="items"
          small
          striped
          responsive
        >
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
      v-model="form"
      :fields="fields"
      icon="cogs"
      inline
      :title="$t('operations')"
      :validations="v"
      form-classes="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-start"
      @submit.prevent="onFormPortToggling"
    />

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
