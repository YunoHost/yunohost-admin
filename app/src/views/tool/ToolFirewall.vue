<template>
  <view-base
    :queries="queries" @queries-response="formatFirewallData"
    ref="view" skeleton="card-form-skeleton"
  >
    <!-- PORTS -->
    <card :title="$t('ports')" icon="shield">
      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>

        <b-table
          :fields="fields" :items="items"
          small striped responsive
        >
          <!-- PORT CELL -->
          <template #cell(port)="data">
            {{ data.value }}
          </template>

          <!-- CONNECTIONS CELL -->
          <template #cell()="data">
            <b-checkbox
              v-if="data.field.key !== 'uPnP'"
              class="on-off-switch"
              v-model="data.value"
              switch
              @change="onTablePortToggling(data.item.port, protocol, data.field.key, data.index, $event)"
            >
              <span :class="'btn btn-sm py-0 btn-' + (data.value ? 'danger' : 'success')">
                {{ $t(data.value ? 'close' : 'open') }}
              </span>
            </b-checkbox>

            <icon
              v-else
              :iname="data.value ? 'check' : 'times'"
              :class="data.value ? 'text-success' : 'text-danger'"
            />
          </template>
        </b-table>
      </div>
    </card>

    <!-- OPERATIONS -->
    <card-form
      :title="$t('operations')" icon="cogs"
      :validation="$v" :server-error="serverError"
      @submit.prevent="onFormPortToggling"
      inline form-classes="d-flex justify-content-between align-items-start"
    >
      <b-input-group :prepend="$t('action')">
        <b-select v-model="form.action" :options="actionChoices" />
      </b-input-group>

      <form-field :validation="$v.form.port">
        <b-input-group :prepend="$t('port')">
          <input-item
            id="input-port" placeholder="0" type="number"
            v-model="form.port"
          />
        </b-input-group>
      </form-field>

      <b-input-group :prepend="$t('connection')">
        <b-select v-model="form.connection" :options="connectionChoices" id="input-connection" />
      </b-input-group>

      <b-input-group :prepend="$t('protocol')">
        <b-select v-model="form.protocol" :options="protocolChoices" id="input-protocol" />
      </b-input-group>
    </card-form>

    <!-- UPnP -->
    <card :title="$t('upnp')" icon="exchange" :body-text-variant="upnpEnabled ? 'success' : 'danger'">
      {{ $t(upnpEnabled ? 'upnp_enabled' : 'upnp_disabled' ) }}

      <b-form-invalid-feedback :state="upnpError !== '' ? false : null">
        {{ upnpError }}
      </b-form-invalid-feedback>

      <template #buttons>
        <b-button @click="toggleUpnp" :variant="!upnpEnabled ? 'success' : 'danger'">
          {{ $t(!upnpEnabled ? 'enable' : 'disable' ) }}
        </b-button>
      </template>
    </card>
  </view-base>
</template>

<script>
import { validationMixin } from 'vuelidate'

import api from '@/api'
import { required, integer, between } from '@/helpers/validators'

export default {
  name: 'ToolFirewall',

  data () {
    return {
      queries: ['/firewall?raw'],
      serverError: '',

      // Ports tables data
      fields: [
        { key: 'port', label: this.$i18n.t('port') },
        { key: 'ipv4', label: this.$i18n.t('ipv4') },
        { key: 'ipv6', label: this.$i18n.t('ipv6') },
        { key: 'uPnP', label: this.$i18n.t('upnp') }
      ],
      protocols: undefined,
      portToToggle: undefined,

      // Ports form data
      actionChoices: [
        { value: 'open', text: this.$i18n.t('open') },
        { value: 'close', text: this.$i18n.t('close') }
      ],
      connectionChoices: [
        { value: 'ipv4', text: this.$i18n.t('ipv4') },
        { value: 'ipv6', text: this.$i18n.t('ipv6') }
      ],
      protocolChoices: [
        { value: 'TCP', text: this.$i18n.t('tcp') },
        { value: 'UDP', text: this.$i18n.t('udp') },
        { value: 'Both', text: this.$i18n.t('both') }
      ],
      form: {
        action: 'open',
        port: undefined,
        connection: 'ipv4',
        protocol: 'TCP'
      },

      // uPnP
      upnpEnabled: undefined,
      upnpError: ''
    }
  },

  validations: {
    form: {
      port: { number: required, integer, between: between(0, 65535) }
    }
  },

  methods: {
    formatFirewallData (data) {
      const ports = Object.values(data).reduce((ports, protocols) => {
        for (const type of ['TCP', 'UDP']) {
          for (const port of protocols[type]) {
            ports[type].add(port)
          }
        }
        return ports
      }, { TCP: new Set(), UDP: new Set() })

      const tables = {
        TCP: [],
        UDP: []
      }
      for (const protocol of ['TCP', 'UDP']) {
        for (const port of ports[protocol]) {
          const row = { port }
          for (const connection of ['ipv4', 'ipv6', 'uPnP']) {
            row[connection] = data[connection][protocol].includes(port)
          }
          tables[protocol].push(row)
        }
        tables[protocol].sort((a, b) => a.port < b.port ? -1 : 1)
      }

      this.protocols = tables
      this.upnpEnabled = data.uPnP.enabled
    },

    togglePort ({ action, port, protocol, connection }) {
      return new Promise((resolve, reject) => {
        this.$askConfirmation(
          this.$i18n.t('confirm_firewall_' + action, { port, protocol, connection })
        ).then(confirmed => {
          if (confirmed) {
            const method = action === 'open' ? 'post' : 'delete'
            api[method](`/firewall/port?${connection}_only`, { port, protocol }).then(() => {
              resolve(confirmed)
            }).catch(error => {
              reject(error)
            })
          } else {
            resolve(confirmed)
          }
        })
      })
    },

    async toggleUpnp (value) {
      const action = this.upnpEnabled ? 'disable' : 'enable'
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_upnp_' + action))
      if (!confirmed) return

      api.get('firewall/upnp?action=' + action).then(() => {
        // FIXME Couldn't test when it works.
        this.$refs.view.fetchQueries()
      }).catch(err => {
        this.upnpError = err.message
      })
    },

    onTablePortToggling (port, protocol, connection, index, value) {
      this.$set(this.protocols[protocol][index], connection, value)
      const action = value ? 'open' : 'close'
      this.togglePort({ action, port, protocol, connection }).then(toggled => {
        // Revert change on cancel
        if (!toggled) {
          this.$set(this.protocols[protocol][index], connection, !value)
        }
      })
    },

    onFormPortToggling (e) {
      this.togglePort(this.form).then(toggled => {
        if (toggled) this.$refs.view.fetchQueries()
      })
    }
  },

  mixins: [validationMixin]
}
</script>

<style lang="scss" scoped>
::v-deep .on-off-switch {
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

  input:focus ~ .custom-control-label, &:hover {
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

::v-deep form {
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
