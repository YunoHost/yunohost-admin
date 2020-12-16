<template>
  <view-base :queries="queries" @queries-response="formatAppData" ref="view">
    <!-- BASIC INFOS -->
    <card v-if="infos" :title="`${$t('infos')} — ${infos.label}`" icon="info-circle">
      <b-row
        v-for="(value, prop) in infos" :key="prop"
        no-gutters class="row-line"
      >
        <b-col cols="auto" md="3">
          <strong>{{ $t(prop) }}</strong>
        </b-col>
        <b-col>
          <a v-if="prop === 'url'" :href="value" target="_blank">{{ value }}</a>
          <span v-else>{{ value }}</span>
        </b-col>
      </b-row>
      <b-row no-gutters class="row-line">
        <b-col cols="auto" md="3">
          <strong>{{ $t('app_info_access_desc') }}</strong>
          <span class="sep" />
        </b-col>
        <b-col>
          {{ allowedGroups.length > 0 ? allowedGroups.join(', ') + '.' : $t('nobody') }}
          <b-button
            size="sm" :to="{ name: 'group-list'}" variant="info"
            class="ml-2"
          >
            <icon iname="key-modern" /> {{ $t('groups_and_permissions_manage') }}
          </b-button>
        </b-col>
      </b-row>
    </card>

    <!-- OPERATIONS -->
    <card v-if="app" :title="$t('operations')" icon="wrench">
      <!-- CHANGE PERMISSIONS LABEL -->
      <b-form-group :label="$t('app_manage_label_and_tiles')" label-class="font-weight-bold">
        <form-field
          v-for="(perm, i) in app.permissions" :key="i"
          :label="perm.title" :label-for="'perm-' + i"
          label-cols="0" label-class="" class="m-0"
          :validation="$v.form.labels.$each[i] "
        >
          <template #default="{ self }">
            <b-input-group>
              <input-item
                :state="self.state" v-model="form.labels[i].label"
                :id="'perm' + i" :aria-describedby="'perm-' + i + '_group__BV_description_'"
              />
              <b-input-group-append v-if="perm.tileAvailable" is-text>
                <checkbox-item v-model="form.labels[i].show_tile" :label="$t('permission_show_tile_enabled')" />
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
            <b-button @click="changeUrl" variant="info" v-t="'save'" />
          </b-input-group-append>
        </b-input-group>

        <div v-else class="alert alert-warning">
          <icon iname="exclamation" /> {{ $t('app_info_change_url_disabled_tooltip') }}
        </div>
      </b-form-group>
      <hr>

      <!-- CHANGE DOMAIN -->
      <b-form-group
        :label="$t('app_info_default_desc', { domain: app.domain })" label-for="main-domain"
        label-class="font-weight-bold" label-cols-md="4"
      >
        <b-button @click="setAsDefaultDomain" id="main-domain" variant="success">
          <icon iname="star" /> {{ $t('app_make_default') }}
        </b-button>
      </b-form-group>
      <hr>

      <!-- UNINSTALL -->
      <b-form-group
        :label="$t('app_info_uninstall_desc')" label-for="uninstall"
        label-class="font-weight-bold" label-cols-md="4"
      >
        <b-button @click="uninstall" id="uninstall" variant="danger">
          <icon iname="trash-o" /> {{ $t('uninstall') }}
        </b-button>
      </b-form-group>
    </card>

    <!-- EXPERIMENTAL (displayed if experimental feature has been enabled in web-admin options)-->
    <card v-if="experimental" :title="$t('experimental')" icon="flask">
      <!-- APP ACTIONS -->
      <b-form-group
        :label="$t('app_actions_label')" label-for="actions"
        label-cols-md="4" label-class="font-weight-bold"
      >
        <b-button id="actions" variant="warning" :to="{ name: 'app-actions', params: { id } }">
          <icon iname="flask" /> {{ $t('app_actions') }}
        </b-button>
      </b-form-group>
      <hr>

      <!-- APP CONFIG PANEL -->
      <b-form-group
        :label="$t('app_config_panel_label')" label-for="config"
        label-cols-md="4" label-class="font-weight-bold"
      >
        <b-button id="config" variant="warning" :to="{ name: 'app-config-panel', params: { id } }">
          <icon iname="flask" /> {{ $t('app_config_panel') }}
        </b-button>
      </b-form-group>
    </card>

    <template #skeleton>
      <card-info-skeleton :item-count="8" />
      <card-form-skeleton />
    </template>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import api from '@/api'
import { readableDate } from '@/helpers/filters/date'
import { humanPermissionName } from '@/helpers/filters/human'
import { required } from '@/helpers/validators'

export default {
  name: 'AppInfo',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        `apps/${this.id}?full`,
        { uri: 'users/permissions?full', storeKey: 'permissions' },
        { uri: 'domains' }
      ],
      infos: undefined,
      app: undefined,
      form: undefined
    }
  },

  computed: {
    ...mapGetters(['domains', 'experimental']),

    allowedGroups () {
      if (!this.app) return
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
    formatAppData (app) {
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

      this.infos = {
        id: this.id,
        label: mainPermission.label,
        description: app.description,
        version: app.version,
        multi_instance: this.$i18n.t(app.manifest.multi_instance ? 'yes' : 'no'),
        install_time: readableDate(app.settings.install_time, true, true)
      }
      if (app.settings.domain) {
        this.infos.url = 'https://' + app.settings.domain + app.settings.path
        form.url = {
          domain: app.settings.domain,
          path: app.settings.path.slice(1)
        }
      }

      this.form = form
      this.app = {
        domain: app.settings.domain,
        supports_change_url: app.supports_change_url,
        permissions
      }
    },

    changeLabel (permName, data) {
      data.show_tile = data.show_tile ? 'True' : 'False'
      api.put('users/permissions/' + permName, data).then(this.$refs.view.fetchQueries)
    },

    async changeUrl () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_app_change_url'))
      if (!confirmed) return

      const { domain, path } = this.form.url
      api.put(
        `apps/${this.id}/changeurl`,
        { domain, path: '/' + path }
      ).then(this.fetchData)
    },

    async setAsDefaultDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_app_default'))
      if (!confirmed) return

      api.put(`apps/${this.id}/default`).then(this.$refs.view.fetchQueries)
    },

    async uninstall () {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_uninstall', { name: this.id })
      )
      if (!confirmed) return

      api.delete('apps/' + this.id).then(() => {
        this.$router.push({ name: 'app-list' })
      })
    }
  },

  filters: { readableDate },
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
