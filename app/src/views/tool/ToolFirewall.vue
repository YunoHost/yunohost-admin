<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    ref="view"
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
              class="on-off-switch"
              v-model="data.value"
              switch
              @change="
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
                :class="
                  'btn btn-sm py-0 btn-' + (data.value ? 'danger' : 'success')
                "
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
      form-classes="d-flex justify-content-between align-items-start"
    >
      <BInputGroup :prepend="$t('action')">
        <BFormSelect v-model="form.action" :options="actionChoices" />
      </BInputGroup>

      <FormField :validation="v$.form.port">
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

<script>
import { useVuelidate } from '@vuelidate/core'

import api from '@/api'
import { required, integer, between } from '@/helpers/validators'

export default {
  name: 'ToolFirewall',

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      queries: [['GET', '/firewall?raw']],
      serverError: '',

      // Ports tables data
      fields: [
        { key: 'port', label: this.$i18n.t('port') },
        { key: 'ipv4', label: this.$i18n.t('ipv4') },
        { key: 'ipv6', label: this.$i18n.t('ipv6') },
        { key: 'uPnP', label: this.$i18n.t('upnp') },
      ],
      protocols: undefined,
      portToToggle: undefined,

      // Ports form data
      actionChoices: [
        { value: 'allow', text: this.$i18n.t('open') },
        { value: 'disallow', text: this.$i18n.t('close') },
      ],
      connectionChoices: [
        { value: 'ipv4', text: this.$i18n.t('ipv4') },
        { value: 'ipv6', text: this.$i18n.t('ipv6') },
      ],
      protocolChoices: [
        { value: 'TCP', text: this.$i18n.t('tcp') },
        { value: 'UDP', text: this.$i18n.t('udp') },
        { value: 'Both', text: this.$i18n.t('both') },
      ],
      form: {
        action: 'allow',
        port: undefined,
        connection: 'ipv4',
        protocol: 'TCP',
      },

      // uPnP
      upnpEnabled: undefined,
      upnpError: '',
    }
  },

  validations: {
    form: {
      port: { number: required, integer, between: between(0, 65535) },
    },
  },

  methods: {
    onQueriesResponse(data) {
      const ports = Object.values(data).reduce(
        (ports, protocols) => {
          for (const type of ['TCP', 'UDP']) {
            for (const port of protocols[type]) {
              ports[type].add(port)
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

      this.protocols = tables
      this.upnpEnabled = data.uPnP.enabled
    },

    async togglePort({ action, port, protocol, connection }) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_firewall_' + action, {
          port,
          protocol,
          connection,
        }),
      )
      if (!confirmed) {
        return Promise.resolve(confirmed)
      }

      const actionTrad = this.$i18n.t(
        { allow: 'open', disallow: 'close' }[action],
      )
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
    },

    async toggleUpnp(value) {
      const action = this.upnpEnabled ? 'disable' : 'enable'
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_upnp_' + action),
      )
      if (!confirmed) return

      api
        .put(
          'firewall/upnp/' + action,
          {},
          { key: 'firewall.upnp', action: this.$i18n.t(action) },
        )
        .then(() => {
          // FIXME Couldn't test when it works.
          this.$refs.view.fetchQueries()
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          this.upnpError = err.message
        })
    },

    onTablePortToggling(port, protocol, connection, index, value) {
      this.$set(this.protocols[protocol][index], connection, value)
      const action = value ? 'allow' : 'disallow'
      this.togglePort({ action, port, protocol, connection }).then(
        (toggled) => {
          // Revert change on cancel
          if (!toggled) {
            this.$set(this.protocols[protocol][index], connection, !value)
          }
        },
      )
    },

    onFormPortToggling(e) {
      this.togglePort(this.form).then((toggled) => {
        if (toggled) this.$refs.view.fetchQueries()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.on-off-switch) {
  .custom-control-input {
    &:checked ~ .custom-control-label::before {
      border-color: $success;
      background-color: $success;
    }
    &:not(:checked) ~ .custom-control-label {
      &::before {
        border-color: $danger;
        background-color: $danger;
      }
      &::after {
        background-color: $white;
      }
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
    @include media-breakpoint-down(xs) {
      display: none;
    }
  }
}

:deep(form) {
  margin-bottom: -1rem;

  & > * {
    margin-bottom: 1rem;
  }

  @include media-breakpoint-down(xs) {
    fieldset {
      width: 100%;
    }
  }
}
</style>
