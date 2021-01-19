<template>
  <card-form
    :title="title" icon="globe" :submit-text="submitText"
    :validation="$v" :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <slot name="disclaimer" slot="disclaimer" />

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

      <form-field
        v-bind="fields.domain" v-model="form.domain"
        :validation="$v.form.domain" class="mt-3"
      />
    </b-collapse>

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

      <form-field v-bind="fields.dynDomain" :validation="$v.form.dynDomain" class="mt-3">
        <template #default="{ self }">
          <adress-input-select v-bind="self" v-model="form.dynDomain" />
        </template>
      </form-field>
    </b-collapse>
    <div v-if="dynDnsForbiden" class="alert alert-warning mt-2" v-html="$t('domain_add_dyndns_forbidden')" />
  </card-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import AdressInputSelect from '@/components/AdressInputSelect'
import { formatFormDataValue } from '@/helpers/yunohostArguments'
import { required, domain, dynDomain } from '@/helpers/validators'

export default {
  name: 'DomainForm',

  props: {
    title: { type: String, required: true },
    submitText: { type: String, default: null },
    serverError: { type: String, default: '' },
    // Do not query the api (used by postinstall)
    noStore: { type: Boolean, default: false }
  },

  data () {
    return {
      selected: '',

      form: {
        domain: '',
        dynDomain: { localPart: '', separator: '.', domain: 'nohost.me' }
      },

      fields: {
        domain: {
          label: this.$i18n.t('domain_name'),
          props: {
            id: 'domain',
            placeholder: this.$i18n.t('placeholder.domain')
          }
        },

        dynDomain: {
          label: this.$i18n.t('domain_name'),
          props: {
            id: 'dyn-domain',
            placeholder: this.$i18n.t('myserver'),
            type: 'domain',
            choices: ['nohost.me', 'noho.st', 'ynh.fr']
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters(['domains']),

    dynDnsForbiden () {
      if (!this.domains) return false
      const dynDomains = this.fields.dynDomain.props.choices
      return this.domains.some(domain => {
        return dynDomains.some(dynDomain => domain.includes(dynDomain))
      })
    },

    domainIsVisible () {
      return this.selected === 'domain'
    },

    dynDomainIsVisible () {
      return this.selected === 'dynDomain'
    }
  },

  validations () {
    return {
      selected: { required },
      form: {
        domain: this.selected === 'domain' ? { required, domain } : {},
        dynDomain: { localPart: this.selected === 'dynDomain' ? { required, dynDomain } : {} }
      }
    }
  },

  methods: {
    onSubmit () {
      const domainType = this.selected
      this.$emit('submit', {
        domain: formatFormDataValue(this.form[domainType]),
        domainType
      })
    }
  },

  created () {
    if (this.dynDnsForbiden) {
      this.selected = 'domain'
    }
  },

  mixins: [validationMixin],

  components: {
    AdressInputSelect
  }
}
</script>
