<template>
  <div class="app-info" v-if="info">
    <!-- BASIC INFOS -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="info-circle" /> {{ $t('infos') }} — {{ info.label }}</h2>
      </template>

      <b-row
        v-for="(value, prop) in info" :key="prop"
        no-gutters class="row-line"
      >
        <b-col cols="5" md="3" xl="3">
          <strong>{{ $t(prop) }}</strong>
          <span class="sep" />
        </b-col>
        <b-col>
          <a v-if="prop === 'url'" :href="value" target="_blank">{{ value }}</a>
          <span v-else>{{ value }}</span>
        </b-col>
      </b-row>
      <hr>

      <!-- MANAGE USER/GROUP -->
      <p class="mb-2">
        <strong>{{ $t('app_info_access_desc') }}</strong>
        <br>
        {{ app.permissions.length > 0 ? app.permissions.join(', ') + '.' : $t('nobody') }}
      </p>
      <b-button size="sm" :to="{ name: 'group-list'}" variant="info">
        <icon iname="key-modern" /> {{ $t('groups_and_permissions_manage') }}
      </b-button>
    </b-card>

    <!-- OPERATIONS -->
    <b-card>
      <template v-slot:header>
        <h2><icon iname="wrench" /> {{ $t('operations') }}</h2>
      </template>

      <!-- CHANGE LABEL -->
      <b-form-group
        :label="$t('app_info_changelabel_desc')" label-for="input-label"
        label-cols-md="4"
      >
        <b-input-group>
          <b-input id="input-label" v-model="form.label" />
          <template v-slot:append>
            <b-button variant="info" @click="changeLabel">
              <icon iname="tag" /> {{ $t('app_change_label') }}
            </b-button>
          </template>
        </b-input-group>
      </b-form-group>
      <hr>

      <!-- CHANGE URL -->
      <b-form-group
        :label="$t('app_info_changeurl_desc')" label-for="input-url"
        :label-cols-lg="app.supports_change_url ? 4 : 0"
      >
        <b-input-group v-if="app.supports_change_url">
          <b-input-group-prepend>
            <b-input-group-text>https://</b-input-group-text>
          </b-input-group-prepend>

          <b-input-group-prepend class="flex-grow-1">
            <b-select v-model="form.url.domain" :options="domains" />
          </b-input-group-prepend>

          <b-input-group-prepend>
            <b-input-group-text>/</b-input-group-text>
          </b-input-group-prepend>

          <b-input id="input-url" v-model="form.url.path" class="flex-grow-3" />

          <b-input-group-append>
            <b-button variant="info" @click="action = 'changeUrl'" v-b-modal.modal>
              <icon iname="exchange" /> {{ $t('app_change_url') }}
            </b-button>
          </b-input-group-append>
        </b-input-group>

        <b-alert v-else variant="warning" show>
          <icon iname="exclamation" /> {{ $t('app_info_change_url_disabled_tooltip') }}
        </b-alert>
      </b-form-group>
      <hr>

      <!-- CHANGE DOMAIN -->
      <b-form-group label-cols-md="4" :label="$t('app_info_default_desc', { domain: app.domain })" label-for="main-domain">
        <b-input-group>
          <b-button
            id="main-domain" variant="success" v-b-modal.modal
            @click="action = 'setAsDefaultDomain'"
          >
            <icon iname="star" /> {{ $t('app_make_default') }}
          </b-button>
        </b-input-group>
      </b-form-group>
      <hr>

      <!-- UNINSTALL -->
      <b-form-group label-cols-md="4" :label="$t('app_info_uninstall_desc')" label-for="uninstall">
        <b-input-group>
          <b-button
            id="uninstall" variant="danger" v-b-modal.modal
            @click="action = 'uninstall'"
          >
            <icon iname="trash-o" /> {{ $t('uninstall') }}
          </b-button>
        </b-input-group>
      </b-form-group>
    </b-card>

    <!-- MODAL -->
    <b-modal
      v-if="action"
      id="modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="actions[action].method" hide-header
    >
      {{ $t(actions[action].text, actions[action].name ? { name: actions[action].name } : {}) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/helpers/api'
import { readableDate } from '@/filters/date'

export default {
  name: 'AppInfo',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      info: undefined,
      app: undefined,
      form: {
        label: '',
        url: ''
      },
      actions: {
        changeUrl: { method: this.changeUrl, text: 'confirm_app_change_url' },
        setAsDefaultDomain: { method: this.setAsDefaultDomain, text: 'confirm_app_default' },
        uninstall: { method: this.uninstall, text: 'confirm_uninstall', name: this.id }
      },
      action: undefined
    }
  },

  filters: {
    readableDate
  },

  computed: {
    domains () {
      return this.$store.state.data.domains
    }
  },

  methods: {
    fetchData () {
      api.getAll([
        `apps/${this.id}?full`,
        'users/permissions'
      ]).then(([app, { permissions }]) => {
        this.info = {
          id: this.id,
          label: app.settings.label,
          description: app.description,
          version: app.version,
          multi_instance: this.$i18n.t(app.manifest.multi_instance ? 'yes' : 'no'),
          install_time: readableDate(app.settings.install_time, true, true)
        }
        // FIXME is domain really optional ?
        if (app.settings.domain) {
          this.info.url = 'https://' + app.settings.domain + app.settings.path
          this.form.url = {
            domain: app.settings.domain,
            path: app.settings.path.slice(1)
          }
        }
        this.form.label = app.settings.label
        this.app = {
          domain: app.settings.domain,
          supports_change_url: app.supports_change_url,
          permissions: permissions[this.id + '.main'].allowed
        }
      })

      this.$store.dispatch('FETCH', { uri: 'domains' })
    },

    changeLabel () {
      api.put(
        `apps/${this.id}/label`,
        { new_label: this.form.label }
      ).then(this.fetchData)
    },

    changeUrl () {
      const { domain, path } = this.form.url
      api.put(
        `apps/${this.id}/changeurl`,
        { domain, path: '/' + path }
      ).then(this.fetchData)
    },

    setAsDefaultDomain () {
      api.put(`apps/${this.id}/default`).then(this.fetchData)
    },

    uninstall () {
      api.delete('apps/' + this.id).then(() => {
        this.$router.push({ name: 'app-list' })
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group input {
  min-width: 5rem;
}
</style>
