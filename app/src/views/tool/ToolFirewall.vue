<template>
  <div class="tool-log">
    <!-- PORTS -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="shield" /> {{ $t('ports') }}</h2>
      </template>

      <div v-for="(items, protocol) in protocols" :key="protocol">
        <h5>{{ $t(protocol) }}</h5>
        <b-table
          :fields="fields" :items="items"
          small striped responsive="true"
        >
          <!-- PORT CELL -->
          <template v-slot:cell(port)="data">
            {{ data.value }}
          </template>

          <!-- CONNECTIONS CELL -->
          <template v-slot:cell()="data">
            <b-checkbox
              v-if="data.field.key !== 'uPnP'"
              class="on-off-switch"
              v-model="data.value"
              switch
              @change="onToggle(protocol, data.field.key, data.item.port, data.index, $event)"
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
    </b-card>

    <!-- OPERATIONS -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="cogs" /> {{ $t('operations') }}</h2>
      </template>

      <b-form
        id="port-form" inline class="d-flex justify-content-between"
        @submit.prevent="onFormSubmit"
      >
        <b-input-group :prepend="$t('action')">
          <b-select
            id="input-action"
            v-model="form.action" :options="actionChoices"
          />
        </b-input-group>

        <b-input-group :prepend="$t('port')">
          <b-input
            id="input-port" placeholder="0"
            type="number" min="0" max="65535"
            v-model.number="form.port"
          />
        </b-input-group>

        <b-input-group :prepend="$t('connection')">
          <b-select
            id="input-connection"
            v-model="form.connection" :options="connectionChoices"
          />
        </b-input-group>

        <b-input-group :prepend="$t('protocol')">
          <b-select
            id="input-protocol"
            v-model="form.protocol" :options="protocolChoices"
          />
        </b-input-group>
      </b-form>

      <template v-slot:footer>
        <b-button type="submit" form="port-form" variant="success">
          {{ $t('save') }}
        </b-button>
      </template>
    </b-card>

    <!-- UPnP -->
    <b-card :body-text-variant="upnpEnabled ? 'success' : 'danger'">
      <template v-slot:header>
        <h2><icon iname="exchange" /> {{ $t('upnp') }}</h2>
      </template>

      {{ $t(upnpEnabled ? 'upnp_enabled' : 'upnp_disabled' ) }}

      <b-form-invalid-feedback :state="upnpError !== '' ? false : null">
        {{ upnpError }}
      </b-form-invalid-feedback>

      <template v-slot:footer>
        <b-button
          :variant="!upnpEnabled ? 'success' : 'danger'"
          v-b-modal.toggle-upnp-modal
        >
          {{ $t(!upnpEnabled ? 'enable' : 'disable' ) }}
        </b-button>
      </template>
    </b-card>

    <!-- TOGGLE PORT CONFIRM MODAL -->
    <b-modal
      no-close-on-backdrop centered hide-header
      body-bg-variant="danger" body-text-variant="light"
      @ok="togglePort(portToToggle)" ref="modal"
      @cancel="onCancel"
    >
      {{ portToToggle ? $t('confirm_firewall_' + portToToggle.action, portToToggle) : '' }}
    </b-modal>

    <!-- TOGGLE UPNP CONFIRM MODAL -->
    <b-modal
      id="toggle-upnp-modal"
      no-close-on-backdrop centered hide-header
      body-bg-variant="danger" body-text-variant="light"
      @ok="toggleUpnp(!upnpEnabled)"
    >
      {{ $t('confirm_upnp_' + (upnpEnabled ? 'disable' : 'enable')) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'ToolFirewall',

  data () {
    return {
      // Tables data
      fields: [
        { key: 'port', label: this.$i18n.t('port') },
        { key: 'ipv4', label: this.$i18n.t('ipv4') },
        { key: 'ipv6', label: this.$i18n.t('ipv6') },
        { key: 'uPnP', label: this.$i18n.t('upnp') }
      ],
      protocols: undefined,
      portToToggle: undefined,

      // Form data
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

  methods: {
    fetchData () {
      api.get('/firewall?raw').then(data => {
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
      })
    },

    togglePort ({ port, protocol, connection, action, index }) {
      const method = action === 'open' ? 'post' : 'delete'
      api[method](`/firewall/port?${connection}_only`, { port, protocol }).then(() => {
        if (index === -1) this.fetchData()
        this.portToToggle = undefined
      }).catch((err) => {
        console.log(err)
      })
    },

    toggleUpnp (value) {
      api.get('firewall/upnp?action=' + (value ? 'enable' : 'disable')).then(r => {
        // FIXME Couldn't test when it works.
        this.fetchData()
      }).catch(err => {
        this.upnpError = err.message
      })
    },

    onCancel () {
      const { protocol, index, connection, value } = this.portToToggle
      if (index > -1) {
        this.$set(this.protocols[protocol][index], connection, !value)
      }
      this.portToToggle = undefined
    },

    onToggle (protocol, connection, port, index, value) {
      this.$set(this.protocols[protocol][index], connection, value)
      this.portToToggle = {
        protocol, connection, port, action: value ? 'open' : 'close', index, value
      }
      this.$refs.modal.show()
    },

    onFormSubmit (e) {
      // IMPROVEMENT: could check if ports are already opened for known ports (tricky with protocol='Both')
      this.portToToggle = {
        ...this.form,
        value: this.form.action === 'open',
        // set index to -1 to trigger `this.fetchData` at modal `@ok`
        index: -1
      }
      this.$refs.modal.show()
    }
  },

  created () {
    this.fetchData()
  }
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

form {
  margin-bottom: -1rem;

  .input-group {
    margin-bottom: 1rem
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
