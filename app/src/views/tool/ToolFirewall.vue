<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { between, integer, required } from '@/helpers/validators'
import type { Firewall } from '@/types/core/api'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { protocols, upnpEnabled } = await api
  .fetch<Firewall>({ uri: 'firewall?raw' })
  .then((firewall) => {
    const portTypes = ['TCP', 'UDP'] as const
    const protocolsTypes = ['ipv4', 'ipv6', 'uPnP'] as const
    const ports = Object.values(firewall).reduce(
      (ports, protocols) => {
        for (const type of portTypes) {
          for (const port of protocols[type]) {
            ports[type].add(port)
          }
        }
        return ports
      },
      { TCP: new Set<number>(), UDP: new Set<number>() },
    )

    type Row = { port: number } & Record<keyof Firewall, boolean>
    const tables = {
      TCP: [] as Row[],
      UDP: [] as Row[],
    }
    for (const protocol of portTypes) {
      for (const port of ports[protocol]) {
        const row = { port } as Row
        for (const connection of protocolsTypes) {
          row[connection] = firewall[connection][protocol].includes(port)
        }
        tables[protocol].push(row)
      }
      tables[protocol].sort((a, b) => (a.port < b.port ? -1 : 1))
    }

    return {
      protocols: reactive(tables),
      upnpEnabled: ref(firewall.uPnP.enabled),
    }
  })

const upnpError = ref('')
const tableFields = [
  { key: 'port', label: t('port') },
  { key: 'ipv4', label: t('ipv4') },
  { key: 'ipv6', label: t('ipv6') },
  { key: 'uPnP', label: t('upnp') },
]

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
    cProps: {
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
    cProps: { id: 'input-port', placeholder: '0', type: 'number' },
  } satisfies FieldProps<'InputItem', Form['action']>,

  connection: {
    asInputGroup: true,
    component: 'SelectItem',
    label: t('connection'),
    rules: { required },
    cProps: {
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
    cProps: {
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

async function togglePort({
  action,
  port,
  protocol,
  connection,
}: Form): Promise<boolean> {
  const confirmed = await modalConfirm(
    t('confirm_firewall_' + action, {
      port,
      protocol,
      connection,
    }),
  )
  if (!confirmed) return false

  const actionTrad = t({ allow: 'open', disallow: 'close' }[action])
  return api
    .put({
      uri: `firewall/${protocol}/${action}/${port}?${connection}_only`,
      showModal: false,
    })
    .then(() => true)
}

async function toggleUpnp() {
  const action = upnpEnabled.value ? 'disable' : 'enable'
  const confirmed = await modalConfirm(t('confirm_upnp_' + action))
  if (!confirmed) return

  api
    .put({ uri: 'firewall/upnp/' + action })
    .then(() => {
      // FIXME Couldn't test when it works.
      api.refetch()
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      upnpError.value = err.message
    })
}

function onTablePortToggling(
  { port, protocol, connection }: Omit<Form, 'action'>,
  index: number,
  value: boolean,
) {
  const protocols_ =
    protocol === 'Both' ? (['TCP', 'UDP'] as const) : [protocol]
  protocols_.forEach((protocol) => {
    protocols[protocol][index][connection] = value
  })
  const action = value ? 'allow' : 'disallow'
  togglePort({ action, port, protocol, connection }).then((confirmed) => {
    // Revert change on cancel
    if (!confirmed) {
      protocols_.forEach((protocol) => {
        protocols[protocol][index][connection] = !value
      })
    }
  })
}

function onFormPortToggling() {
  togglePort(form.value).then((confirmed) => {
    // TODO: update data instead of refetch?
    if (confirmed) api.refetch()
  })
}
</script>

<template>
  <div>
    <!-- PORTS -->
    <YCard :title="$t('ports')" icon="shield">
      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>

        <BTable :fields="tableFields" :items="items" small striped responsive>
          <!-- PORT CELL -->
          <template #cell(port)="data">
            {{ data.value }}
          </template>

          <!-- CONNECTIONS CELL -->
          <template #cell()="data">
            <BFormCheckbox
              v-if="data.field.key !== 'uPnP'"
              :model-value="data.value as boolean"
              switch
              @update:model-value="
                onTablePortToggling(
                  {
                    port: data.item.port,
                    protocol,
                    connection: data.field.key as Form['connection'],
                  },
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
          :variant="!upnpEnabled ? 'success' : 'danger'"
          @click="toggleUpnp"
        >
          {{ $t(!upnpEnabled ? 'enable' : 'disable') }}
        </BButton>
      </template>
    </YCard>
  </div>
</template>

<style lang="scss" scoped>
:deep() {
  .form-switch {
    .form-check-input {
      &:checked {
        border-color: $success;
        background-color: $success;
      }
      &:not(:checked) {
        --bs-form-switch-bg: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'><circle r='3' fill='%23222222)'/></svg>") !important;
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
