<script setup lang="ts">
import { ref } from 'vue'
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
    // This is because BTable expects a list
    let tcp_ports_array = Object.entries(firewall['tcp']).map(([k, v]) => ({
      port: Number(k),
      open: v.open,
      upnp: v.upnp,
      comment: v.comment,
    }))
    let udp_ports_array = Object.entries(firewall['udp']).map(([k, v]) => ({
      port: Number(k),
      open: v.open,
      upnp: v.upnp,
      comment: v.comment,
    }))
    return {
      protocols: { tcp: tcp_ports_array, udp: udp_ports_array },
      upnpEnabled: ref(firewall.router_forwarding_upnp),
    }
  })

const upnpError = ref('')
const tableFields = [
  { key: 'port', label: t('port') },
  { key: 'open', label: t('open') },
  { key: 'upnp', label: t('upnp') },
  { key: 'comment', label: t('comment') },
]

type Form = {
  action: 'open' | 'close'
  port: number
  protocol: 'tcp' | 'udp'
  upnp: boolean
  comment: string
}

const form = ref<Form>({
  action: 'open',
  port: 0,
  protocol: 'tcp',
  upnp: false,
  comment: '',
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
        { value: 'open', text: t('open') },
        { value: 'close', text: t('close') },
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

  protocol: {
    asInputGroup: true,
    component: 'SelectItem',
    label: t('protocol'),
    rules: { required },
    cProps: {
      id: 'input-protocol',
      choices: [
        { value: 'tcp', text: t('tcp') },
        { value: 'udp', text: t('udp') },
      ],
    },
  } satisfies FieldProps<'SelectItem', Form['protocol']>,

  upnp: {
    asInputGroup: true,
    component: 'CheckboxItem',
    label: t('upnp'),
    rules: { required },
    cProps: { id: 'upnp', labels: { true: 'enabled', false: 'disabled' } },
  } satisfies FieldProps<'CheckboxItem', Form['upnp']>,

  comment: {
    asInputGroup: true,
    component: 'InputItem',
    // label: t('comment'),
    label: 'Comment FIXME translate',
    rules: { string: required },
    cProps: { id: 'comment', placeholder: '', type: 'text' },
  } satisfies FieldProps<'InputItem', Form['upnp']>,
} satisfies FormFieldDict<Form>

const { v } = useForm(form, fields)

async function togglePort({
  action,
  port,
  protocol,
  upnp,
  comment,
}: Form): Promise<boolean> {
  const confirmed = await modalConfirm(
    t('confirm_firewall_' + action, {
      port,
      protocol,
    }),
  )
  if (!confirmed) return false

  let argupnp = upnp ? '&upnp' : ''
  return api
    .put({
      uri: `firewall/${protocol}/${action}/${port}?comment=${comment}${argupnp}`,
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
  { port, protocol, upnp, comment }: Omit<Form, 'action'>,
  index: number,
  value: boolean,
) {
  protocols[protocol][index]['open'] = value
  // FIXME: handle upnp properly
  protocols[protocol][index]['upnp'] = value && upnp
  // FIXME: maybe someday handle comment edition?

  const action = value ? 'open' : 'close'
  togglePort({ action, port, protocol, upnp, comment }).then((confirmed) => {
    // Revert change on cancel
    if (!confirmed) {
      protocols[protocol][index]['open'] = !value
    }
    protocols[protocol][index]['upnp'] = !value && upnp
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
              :model-value="data.value as boolean"
              switch
              @update:model-value="
                onTablePortToggling(
                  {
                    port: data.item.port,
                    protocol,
                    upnp: data.item.upnp,
                    comment: data.item.comment,
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
          </template>

          <template #cell(comment)="data">
            {{ data.value }}
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
