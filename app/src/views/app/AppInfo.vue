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
        {{ allowedGroups.length > 0 ? allowedGroups.join(', ') + '.' : $t('nobody') }}
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

      <!-- CHANGE PERMISSIONS LABEL -->
      <b-form-group :label="$t('app_manage_label_and_tiles')" label-class="font-weight-bold" :description="$t('app_info_managelabel_desc')">
        <form-field
          v-for="(perm, i) in app.permissions" :key="i"
          :label="perm.title" :label-for="'perm-' + i"
          label-cols="0" label-class=""
          :validation="$v.form.labels.$each[i] "
        >
          <template #default="{ self }">
            <b-input-group>
              <input-item
                :state="self.state" v-model="form.labels[i].label"
                :id="'perm' + i" :aria-describedby="'perm-' + i + '_group__BV_description_'"
              />
              <b-input-group-append v-if="perm.tileAvailable" is-text>
                <checkbox-item v-model="form.labels[i].show_tile" label="Visible as tile in user portal" />
              </b-input-group-append>
              <b-input-group-append>
                <b-button
                  variant="info" v-t="'save'"
                  @click="changeLabel(perm.name, form.labels[i])"
                />
              </b-input-group-append>
            </b-input-group>
          </template>

          <template #description>
            {{ $t('permission_corresponding_url') }}:
            <b-link :href="'https:' + perm.url">
              https://{{ perm.url }}
            </b-link>
          </template>
        </form-field>
      </b-form-group>
      <hr>

      <!-- CHANGE URL -->
      <b-form-group
        :label="$t('app_info_changeurl_desc')" label-for="input-url"
        :label-cols-lg="app.supports_change_url ? 0 : 0" label-class="font-weight-bold"
      >
        <b-input-group v-if="app.supports_change_url">
          <b-input-group-prepend is-text>
            https://
          </b-input-group-prepend>

          <b-input-group-prepend class="flex-grow-1">
            <b-select v-model="form.url.domain" :options="domains" />
          </b-input-group-prepend>

          <b-input-group-prepend is-text>
            /
          </b-input-group-prepend>

          <b-input id="input-url" v-model="form.url.path" class="flex-grow-3" />

          <b-input-group-append>
            <b-button
              variant="info" v-t="'save'"
              @click="action = 'changeUrl'" v-b-modal.modal
            />
          </b-input-group-append>
        </b-input-group>

        <b-alert v-else variant="warning" show>
          <icon iname="exclamation" /> {{ $t('app_info_change_url_disabled_tooltip') }}
        </b-alert>
      </b-form-group>
      <hr>

      <!-- CHANGE DOMAIN -->
      <b-form-group
        :label="$t('app_info_default_desc', { domain: app.domain })" label-for="main-domain"
        label-class="font-weight-bold" label-cols-md="4"
      >
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
      <b-form-group
        :label="$t('app_info_uninstall_desc')" label-for="uninstall"
        label-class="font-weight-bold" label-cols-md="4"
      >
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

    <!-- EXPERIMENTAL (displayed if experimental feature has been enabled in web-admin options)-->
    <b-card v-if="this.$store.getters.experimental">
      <template v-slot:header>
        <h2><icon iname="flask" /> {{ $t('experimental') }}</h2>
      </template>

      <!-- APP ACTIONS -->
      <b-form-group label-cols-md="4" :label="$t('app_actions_label')" label-for="actions">
        <b-input-group>
          <b-button id="actions" variant="warning" :to="{ name: 'app-actions', params: { id } }">
            <icon iname="flask" /> {{ $t('app_actions') }}
          </b-button>
        </b-input-group>
      </b-form-group>
      <hr>

      <!-- APP CONFIG PANEL -->
      <b-form-group label-cols-md="4" :label="$t('app_config_panel_label')" label-for="config">
        <b-input-group>
          <b-button id="config" variant="warning" :to="{ name: 'app-config-panel', params: { id } }">
            <icon iname="flask" /> {{ $t('app_config_panel') }}
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
import { validationMixin } from 'vuelidate'

import api from '@/api'
import { readableDate } from '@/helpers/filters/date'
import { humanPermissionName } from '@/helpers/filters/human'
import { required } from '@/helpers/validators'

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
      form: undefined,
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
    },

    allowedGroups () {
      return this.app.permissions[0].allowed
    }
  },

  validations () {
    return {
      form: {
        labels: {
          $each: { label: { required } }
        },
        url: { path: { required } }
      }
    }
  },

  methods: {
    fetchData () {
      this.$store.dispatch('FETCH', { uri: 'users/permissions?full', storeKey: 'permissions' }).then(a => {
        console.log(a)
      })
      api.get(`apps/${this.id}?full`).then((app) => {
        const form = { labels: [] }

        const mainPermission = app.permissions[this.id + '.main']
        mainPermission.name = this.id + '.main'
        mainPermission.title = this.$i18n.t('permission_main')
        mainPermission.tileAvailable = mainPermission.url !== null && !mainPermission.url.startsWith('re:')
        form.labels.push({ label: mainPermission.label, show_tile: mainPermission.show_tile })

        const permissions = [mainPermission]
        for (const [name, perm] of Object.entries(app.permissions)) {
          if (!name.endsWith('.main')) {
            permissions.push({
              ...perm,
              name,
              label: perm.sublabel,
              title: humanPermissionName(name),
              tileAvailable: perm.url !== null && !perm.url.startsWith('re:')
            })
            form.labels.push({ label: perm.sublabel, show_tile: perm.show_tile })
          }
        }

        console.log(app.permissions)
        this.info = {
          id: this.id,
          // FIXME permission
          label: mainPermission.label,
          description: app.description,
          version: app.version,
          multi_instance: this.$i18n.t(app.manifest.multi_instance ? 'yes' : 'no'),
          install_time: readableDate(app.settings.install_time, true, true)
        }
        if (app.settings.domain) {
          this.info.url = 'https://' + app.settings.domain + app.settings.path
          form.url = {
            domain: app.settings.domain,
            path: app.settings.path.slice(1)
          }
        }
        // FIXME permission
        this.form = form
        this.app = {
          domain: app.settings.domain,
          supports_change_url: app.supports_change_url,
          // FIXME permission
          permissions
        }
      })

      this.$store.dispatch('FETCH', { uri: 'domains' })
    },

    changeLabel (permName, data) {
      data.show_tile = data.show_tile ? 'True' : 'False'
      console.log(permName, data)
      api.put('users/permissions/' + permName, data).then(this.fetchData)
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
  },

  mixins: [validationMixin]
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
