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

      <!-- DNS CONFIG -->
      <p>{{ $t('domain_dns_longdesc') }}</p>
      <b-button :to="{ name: 'domain-dns', param: { name } }">
        <icon iname="globe" /> {{ $t('domain_dns_config') }}
      </b-button>
      <hr>

      <!-- SSL CERTIFICATE -->
      <p>{{ $t('certificate_manage') }}</p>
      <b-button :to="{ name: 'domain-cert', param: { name } }">
        <icon iname="lock" /> {{ $t('ssl_certificate') }}
      </b-button>
      <hr>

      <!-- DELETE -->
      <p>{{ $t('domain_delete_longdesc') }}</p>
      <p
        v-if="isMainDomain" class="alert alert-danger"
        v-html="$t('domain_delete_forbidden_desc', { domain: name })"
      />
      <b-button v-else variant="danger" @click="deleteDomain">
        <icon iname="trash-o" /> {{ $t('delete') }}
      </b-button>
    </card>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DomainInfo',

  props: {
    name: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      queries: [{ uri: 'domains/main', storeKey: 'main_domain' }]
    }
  },

  computed: {
    ...mapGetters(['mainDomain']),

    isMainDomain () {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    }
  },

  methods: {
    async deleteDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name: this.name }))
      if (!confirmed) return

      this.$store.dispatch('DELETE',
        { uri: 'domains', param: this.name }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      })
    },

    async setAsDefaultDomain () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_change_maindomain'))
      if (!confirmed) return

      this.$store.dispatch('PUT',
        { uri: 'domains/main', data: { new_main_domain: this.name }, storeKey: 'main_domain' }
      ).then(() => {
        // Have to commit by hand here since the response is empty
        this.$store.commit('UPDATE_MAIN_DOMAIN', this.name)
      })
    }
  }
}
</script>
