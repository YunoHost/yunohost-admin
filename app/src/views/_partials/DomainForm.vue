<template>
  <CardForm
    :title="title"
    icon="globe"
    :submit-text="submitText"
    :validation="v$"
    :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <template #disclaimer>
      <slot name="disclaimer" />
    </template>

    <BFormRadio
      v-model="selected"
      name="domain-type"
      value="domain"
      :class="domainIsVisible ? null : 'collapsed'"
      :aria-expanded="domainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-domain"
      class="mb-2"
    >
      {{ $t('domain.add.from_registrar') }}
    </BFormRadio>

    <BCollapse id="collapse-domain" v-model:visible="domainIsVisible">
      <p class="mt-2 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="pl-1" v-html="$t('domain.add.from_registrar_desc')" />
      </p>

      <FormField
        v-bind="fields.domain"
        v-model="form.domain"
        :validation="v$.form.domain"
        class="mt-3"
      />
    </BCollapse>

    <BFormRadio
      v-model="selected"
      name="domain-type"
      value="dynDomain"
      :disabled="dynDnsForbiden"
      :class="dynDomainIsVisible ? null : 'collapsed'"
      :aria-expanded="dynDomainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-dynDomain"
      class="mb-2"
    >
      {{ $t('domain.add.from_yunohost') }}
    </BFormRadio>

    <BCollapse id="collapse-dynDomain" v-model:visible="dynDomainIsVisible">
      <p class="mt-2 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="pl-1" v-html="$t('domain.add.from_yunohost_desc')" />
      </p>

      <FormField
        v-bind="fields.dynDomain"
        :validation="v$.form.dynDomain"
        class="mt-3"
      >
        <template #default="{ self }">
          <AdressInputSelect v-bind="self" v-model="form.dynDomain" />
        </template>
      </FormField>

      <FormField
        v-bind="fields.dynDomainPassword"
        :validation="v$.form.dynDomainPassword"
        v-model="form.dynDomainPassword"
      />

      <FormField
        v-bind="fields.dynDomainPasswordConfirmation"
        :validation="v$.form.dynDomainPasswordConfirmation"
        v-model="form.dynDomainPasswordConfirmation"
      />
    </BCollapse>
    <div
      v-if="dynDnsForbiden"
      class="alert alert-warning mt-2"
      v-html="$t('domain_add_dyndns_forbidden')"
    />

    <BFormRadio
      v-model="selected"
      name="domain-type"
      value="localDomain"
      :class="localDomainIsVisible ? null : 'collapsed'"
      :aria-expanded="localDomainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-localDomain"
    >
      {{ $t('domain.add.from_local') }}
    </BFormRadio>

    <BCollapse id="collapse-localDomain" v-model:visible="localDomainIsVisible">
      <p class="mt-2 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="pl-1" v-html="$t('domain.add.from_local_desc')" />
      </p>

      <FormField
        v-bind="fields.localDomain"
        :validation="v$.form.localDomain"
        class="mt-3"
      >
        <template #default="{ self }">
          <AdressInputSelect v-bind="self" v-model="form.localDomain" />
        </template>
      </FormField>
    </BCollapse>
  </CardForm>
</template>

<script>
import { mapGetters } from 'vuex'
import { useVuelidate } from '@vuelidate/core'

import AdressInputSelect from '@/components/AdressInputSelect.vue'
import { formatFormData } from '@/helpers/yunohostArguments'
import {
  required,
  domain,
  dynDomain,
  minLength,
  sameAs,
} from '@/helpers/validators'

export default {
  compatConfig: { MODE: 3 },
  name: 'DomainForm',

  props: {
    title: { type: String, required: true },
    submitText: { type: String, default: null },
    serverError: { type: String, default: '' },
  },

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      selected: '',

      form: {
        domain: '',
        dynDomain: { localPart: '', separator: '.', domain: 'nohost.me' },
        dynDomainPassword: '',
        dynDomainPasswordConfirmation: '',
        localDomain: { localPart: '', separator: '.', domain: 'local' },
      },

      fields: {
        domain: {
          label: this.$i18n.t('domain_name'),
          props: {
            id: 'domain',
            placeholder: this.$i18n.t('placeholder.domain'),
          },
        },

        dynDomain: {
          label: this.$i18n.t('domain_name'),
          props: {
            id: 'dyn-domain',
            placeholder: this.$i18n.t('placeholder.domain').split('.')[0],
            type: 'domain',
            choices: ['nohost.me', 'noho.st', 'ynh.fr'],
          },
        },

        dynDomainPassword: {
          label: this.$i18n.t('domain.add.dyn_dns_password'),
          description: this.$i18n.t('domain.add.dyn_dns_password_desc'),
          props: {
            id: 'dyn-dns-password',
            placeholder: '••••••••',
            type: 'password',
          },
        },

        dynDomainPasswordConfirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: {
            id: 'dyn-dns-password-confirmation',
            placeholder: '••••••••',
            type: 'password',
          },
        },

        localDomain: {
          label: this.$i18n.t('domain_name'),
          props: {
            id: 'dyn-domain',
            placeholder: this.$i18n.t('placeholder.domain').split('.')[0],
            type: 'domain',
            choices: ['local', 'test'],
          },
        },
      },
    }
  },

  computed: {
    ...mapGetters(['domains']),

    dynDnsForbiden() {
      if (!this.domains) return false
      const dynDomains = this.fields.dynDomain.props.choices
      return this.domains.some((domain) => {
        return dynDomains.some((dynDomain) => domain.includes(dynDomain))
      })
    },

    domainIsVisible() {
      return this.selected === 'domain'
    },

    dynDomainIsVisible() {
      return this.selected === 'dynDomain'
    },

    localDomainIsVisible() {
      return this.selected === 'localDomain'
    },
  },

  validations() {
    return {
      selected: { required },
      form: ['domain', 'localDomain'].includes(this.selected)
        ? {
            [this.selected]:
              this.selected === 'domain'
                ? { required, domain }
                : { localPart: { required, dynDomain } },
          }
        : {
            dynDomain: { localPart: { required, dynDomain } },
            dynDomainPassword: { passwordLenght: minLength(8) },
            dynDomainPasswordConfirmation: {
              passwordMatch: sameAs('dynDomainPassword'),
            },
          },
    }
  },

  methods: {
    async onSubmit() {
      const domainType = this.selected
      const form = await formatFormData({
        domain: this.form[domainType],
        dyndns_recovery_password:
          domainType === 'dynDomain' ? this.form.dynDomainPassword : '',
      })
      this.$emit('submit', form)
    },
  },

  created() {
    if (this.dynDnsForbiden) {
      this.selected = 'domain'
    }
  },

  components: {
    AdressInputSelect,
  },
}
</script>
