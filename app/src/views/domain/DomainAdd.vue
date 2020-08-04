<template lang="html">
  <basic-form
    :header="$t('domain_add')" :submit="$t('add')"
    @submit.prevent="onSubmit"
  >
    <!-- DOMAIN -->
    <b-form-radio
      v-model="selected" name="domain-type" value="domain"
      :class="domainIsVisible ? null : 'collapsed'"
      :aria-expanded="domainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-domain"
    >
      {{ $t('domain_add_panel_with_domain') }}
    </b-form-radio>

    <b-collapse id="collapse-domain" :visible.sync="domainIsVisible">
      <small v-html="$t('domain_add_dns_doc')" />

      <b-form-group
        label-cols="auto"
        :label="$t('domain_name')" label-for="input-domain" label-tag="strong"
      >
        <b-input
          id="input-domain" :placeholder="$t('placeholder.domain')"
          aria-describedby="domain-feedback"
          v-model="form.domain" :state="isValid.domain"
          @input="validateDomainName($event)"
        />

        <b-form-invalid-feedback id="domain-feedback" :state="isValid.domain">
          {{ this.error.domain }}
        </b-form-invalid-feedback>
      </b-form-group>
    </b-collapse>

    <!-- DYN DOMAIN -->
    <b-form-radio
      v-model="selected" name="domain-type" value="dynDomain"
      :disabled="dynDnsForbiden"
      :class="dynDomainIsVisible ? null : 'collapsed'"
      :aria-expanded="dynDomainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-dynDomain"
    >
      {{ $t('domain_add_panel_without_domain') }}
    </b-form-radio>

    <b-collapse id="collapse-dynDomain" :visible.sync="dynDomainIsVisible">
      <small>{{ $t('domain_add_dyndns_doc') }}</small>

      <b-form-group
        label-cols="auto"
        :label="$t('domain_name')" label-for="input-dynDomain"
      >
        <adress-input-select
          id="input-dynDomain" feedback-id="dynDomain-feedback"
          v-model="form.dynDomain" :options="dynDomains"
          :state="isValid.dynDomain" :placeholder="$t('myserver')"
          separator="."
          @input="validateDomainName($event)"
        />

        <b-form-invalid-feedback id="dynDomain-feedback" :state="isValid.dynDomain">
          {{ this.error.dynDomain }}
        </b-form-invalid-feedback>
      </b-form-group>
    </b-collapse>
  </basic-form>
</template>

<script>
import BasicForm from '@/components/BasicForm'
import AdressInputSelect from '@/components/AdressInputSelect'

export default {
  name: 'GroupCreate',

  data () {
    return {
      selected: '',
      dynDomains: ['nohost.me', 'noho.st', 'ynh.fr'],
      form: {
        domain: '',
        dynDomain: ['', 'nohost.me']
      },
      isValid: {
        domainname: null,
        dynDomainname: null
      },
      error: {
        domain: '',
        dynDomain: ''
      }
    }
  },

  computed: {
    domains () {
      return this.$store.state.data.domains
    },

    dynDnsForbiden () {
      if (!this.domains) return true
      return this.domains.some(domain => {
        return this.dynDomains.some(dynDomain => domain.includes(dynDomain))
      })
    },

    domainIsVisible () {
      return this.selected === 'domain'
    },

    dynDomainIsVisible () {
      return this.selected === 'dynDomain'
    }
  },

  methods: {
    onSubmit () {
      const domainType = this.selected
      this.validateDomainName(this.form[domainType])
      if (this.isValid[domainType] === false) return

      const query = {
        uri: 'domains',
        data: { domain: this.form[domainType] },
        storeKey: 'domains'
      }
      if (domainType === 'dynDomain') {
        query.uri += '?dyndns'
        query.data.domain = query.data.domain.join('.')
      }
      this.$store.dispatch('POST', query).then(() => {
        this.$router.push({ name: 'domain-list' })
      }).catch(error => {
        this.error[domainType] = error.message
        this.isValid[domainType] = false
      })
    },

    validateDomainName (name) {
      const domainType = this.selected
      const domainname = domainType === 'domain' ? name : name[0]
      const regex = domainType === 'domain' ? '^[.a-z0-9-]+$' : '^[a-z0-9-]+$'
      let error = ''
      if (!domainname.match(regex)) {
        error = this.$i18n.t(`form_errors.${domainType}_syntax`)
      }
      this.error[this.selected] = error
      this.isValid[this.selected] = error === '' ? null : false
    }
  },

  created () {
    this.$store.dispatch('FETCH', { uri: 'domains' }).then(() => {
      if (this.dynDnsForbiden) {
        this.selected = 'domain'
      }
    })
  },

  components: {
    AdressInputSelect,
    BasicForm
  }
}
</script>

<style lang="scss" scoped>
</style>
