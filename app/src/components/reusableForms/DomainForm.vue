<template>
  <b-card header-tag="h2" class="basic-form">
    <template v-slot:header>
      <h2><icon iname="globe" /> {{ title }}</h2>
    </template>

    <b-form id="domain-form" @submit.prevent="onSubmit">
      <slot name="message" />

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
          label-cols="auto" class="mt-2"
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
          label-cols="auto" class="mt-2"
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
    </b-form>

    <template v-slot:footer>
      <b-button
        type="submit" form="domain-form" variant="success"
        :disabled="!everythingValid"
      >
        {{ submitText ? submitText : $t('add') }}
      </b-button>
    </template>
  </b-card>
</template>

<script>
import AdressInputSelect from '@/components/AdressInputSelect'

export default {
  name: 'DomainForm',

  props: {
    title: {
      type: String,
      required: true
    },
    submitText: {
      type: String,
      default: null
    },
    isValid: {
      type: Object,
      default: () => ({
        domainname: undefined,
        dynDomainname: undefined
      })
    },
    error: {
      type: Object,
      default: () => ({
        domain: '',
        dynDomain: ''
      })
    }
  },

  data () {
    return {
      selected: '',
      dynDomains: ['nohost.me', 'noho.st', 'ynh.fr'],
      form: {
        domain: '',
        dynDomain: ['', 'nohost.me']
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
    },

    everythingValid () {
      const domain = this.form[this.selected]
      if (!domain || !domain[0]) return false
      this.validateDomainName(domain)
      return this.isValid[this.selected] !== false
    }
  },

  methods: {
    onSubmit () {
      if (!this.everythingValid) return

      const domainType = this.selected
      const domain = this.form[domainType]
      this.$emit('submit', {
        domain: domainType === 'dynDomain' ? domain.join('.') : domain,
        domainType
      })
    },

    validateDomainName (name) {
      const domainType = this.selected
      const domainname = domainType === 'domain' ? name : name[0]
      const regex = domainType === 'domain' ? '^[.a-z0-9-]+$' : '^[a-z0-9-]+$'
      let error = ''
      if (!domainname.match(regex) || (domainType === 'domain' ? !domainname.includes('.') : false)) {
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
    AdressInputSelect
  }
}
</script>
