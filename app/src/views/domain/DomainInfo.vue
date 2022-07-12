<template>
  <view-base :queries="queries" skeleton="card-list-skeleton">
    <card :title="name" icon="globe">
      <!-- VISIT -->
      <p>{{ $t('domain_visit_url', { url: 'https://' + name }) }}</p>
      <b-button variant="success" :href="'https://' + name" target="_blank">
        <icon iname="external-link" /> {{ $t('domain_visit') }}
      </b-button>
      <hr>

      <!-- DEFAULT DOMAIN -->
      <p>{{ $t('domain_default_desc') }}</p>
      <p v-if="isMainDomain" class="alert alert-info">
        <icon iname="star" /> {{ $t('domain_default_longdesc') }}
      </p>
      <b-button v-else variant="info" @click="setAsDefaultDomain">
        <icon iname="star" /> {{ $t('set_default') }}
      </b-button>
      <hr>

      <!-- DOMAIN CONFIG -->
      <p>{{ $t('domain.config.edit') }}</p>
      <b-button variant="warning" :to="{ name: 'domain-config', param: { name } }">
        <icon iname="cog" /> {{ $t('domain.config.title') }}
      </b-button>
      <hr>

      <!-- DNS CONFIG -->
      <p>{{ $t('domain.dns.edit') }}</p>
      <b-button variant="warning" :to="{ name: 'domain-dns', param: { name } }">
        <icon iname="globe" /> {{ $t('domain_dns_config') }}
      </b-button>
      <hr>

      <!-- SSL CERTIFICATE -->
      <p>{{ $t('certificate_manage') }}</p>
      <b-button variant="outline-dark" :to="{ name: 'domain-cert', param: { name } }">
        <icon iname="lock" /> {{ $t('ssl_certificate') }}
      </b-button>
      <hr>

      <!-- DELETE -->
      <p>{{ $t('domain_delete_longdesc') }}</p>
      <p
        v-if="isMainDomain" class="alert alert-info"
        v-html="$t('domain_delete_forbidden_desc', { domain: name })"
      />
      <div v-else>
        <div v-if="isDynDNS">
          <p
            class="alert alert-info"
            v-html="$t('domain_unsubscribe_desc')"
          />
          <b-modal
            id="modal-unsubscribe"
            ref="modal"
            :title="$t('unsubscribe')"
            header-bg-variant="warning"
            body-bg-variant="light"
            hide-footer
            @show="resetModal"
            @hidden="resetModal"
            @ok="handleOk"
          >
            <form ref="form" @submit.stop.prevent="handleSubmit">
              <b-form-group
                :label="$t('domain_password')"
                label-for="password-input"
                :invalid-feedback="$t('password_required')"
                :state="passwordState"
              >
                <b-form-input
                  id="password-input"
                  type="password"
                  v-model="domain_password"
                  :state="passwordState"
                  required
                />
              </b-form-group>
            </form>
            <b-button class="mt-3" block
                      @click="$bvModal.hide('modal-unsubscribe')"
            >
              {{ $t('cancel') }}
            </b-button>
            <b-button class="mt-3" variant="danger" block
                      @click="handleSubmit()"
            >
              <icon iname="trash-o" /> {{ $t('delete_unsubscribe') }}
            </b-button>
          </b-modal>
          <div class="container">
            <div class="row">
              <div class="col">
                <b-button variant="danger" block v-b-modal.modal-unsubscribe>
                  <icon iname="trash-o" /> {{ $t('delete_unsubscribe') }}
                </b-button>
              </div>
              <div class="col">
                <b-button variant="danger" block @click="deleteDomain">
                  <icon iname="trash-o" /> {{ $t('delete') }}
                </b-button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <b-button variant="danger" @click="deleteDomain">
            <icon iname="trash-o" /> {{ $t('delete') }}
          </b-button>
        </div>
      </div>
    </card>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'

import api from '@/api'

export default {
  name: 'DomainInfo',

  props: {
    name: {
      type: String,
      required: true
    }
  },

  data: () => {
    return {
      queries: [
        ['GET', { uri: 'domains/main', storeKey: 'main_domain' }],
        ['GET', { uri: 'domains?full=1', storeKey: 'fullDomains' }]
      ],
      domain_password: '',
      passwordState: null
    }
  },

  computed: {
    ...mapGetters(['mainDomain']),

    isMainDomain () {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    },

    isDynDNS () {
      if (!this.$store.state.data.full_domains) return
      return this.$store.state.data.full_domains.find(item => item.name === this.name).isdyndns
    }
  },

  methods: {
    async deleteDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name: this.name }))
      if (!confirmed) return
      const data = this.isDynDNS ? { no_unsubscribe: true } : {}

      api.delete(
        { uri: 'domains', param: this.name }, data, { key: 'domains.delete', name: this.name }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      })
    },

    async setAsDefaultDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_change_maindomain'))
      if (!confirmed) return

      api.put(
        { uri: `domains/${this.name}/main`, storeKey: 'main_domain' },
        {},
        { key: 'domains.set_default', name: this.name }
      ).then(() => {
        // FIXME Have to commit by hand here since the response is empty (should return the given name)
        this.$store.commit('UPDATE_MAIN_DOMAIN', this.name)
      })
    },
    checkFormValidity () {
      const valid = this.$refs.form.checkValidity()
      this.passwordState = valid
      return valid
    },
    resetModal () {
      this.domain_password = ''
      this.passwordState = null
    },
    handleOk (bvModalEvent) {
      // Prevent modal from closing
      bvModalEvent.preventDefault()
      // Trigger submit handler
      this.handleSubmit()
    },
    handleSubmit () {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return
      }

      api.delete(
        { uri: 'domains', param: this.name }, { unsubscribe: this.domain_password }, { key: 'domains.delete', name: this.name }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      })

      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-unsubscribe')
      })
    }
  }
}
</script>
