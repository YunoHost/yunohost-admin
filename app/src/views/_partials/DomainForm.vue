<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AdressInputSelect from '@/components/AdressInputSelect.vue'
import {
  domain,
  dynDomain,
  minLength,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatFormData } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    title: string
    submitText?: string | null
    serverError?: string
  }>(),
  {
    submitText: null,
    serverError: '',
  },
)
const emit = defineEmits(['submit'])

const { t } = useI18n()

const { domains } = useStoreGetters()
const dynDomains = ['nohost.me', 'noho.st', 'ynh.fr']

const dynDnsForbiden = computed(() => {
  if (!domains.value) return false
  return domains.value.some((domain) => {
    return dynDomains.some((dynDomain) => domain.includes(dynDomain))
  })
})

const selected = ref(dynDnsForbiden.value ? 'domain' : '')
const form = reactive({
  domain: '',
  dynDomain: { localPart: '', separator: '.', domain: 'nohost.me' },
  dynDomainPassword: '',
  dynDomainPasswordConfirmation: '',
  localDomain: { localPart: '', separator: '.', domain: 'local' },
})

const rules = computed(() => ({
  selected: { required },
  form: ['domain', 'localDomain'].includes(selected.value)
    ? {
        [selected.value]:
          selected.value === 'domain'
            ? { required, domain }
            : { localPart: { required, dynDomain } },
      }
    : {
        dynDomain: { localPart: { required, dynDomain } },
        dynDomainPassword: { passwordLenght: minLength(8) },
        dynDomainPasswordConfirmation: {
          passwordMatch: sameAs(form.dynDomainPassword),
        },
      },
}))
const v$ = useVuelidate(rules, { selected, form })

const fields = {
  domain: {
    label: t('domain_name'),
    props: {
      id: 'domain',
      placeholder: t('placeholder.domain'),
    },
  },

  dynDomain: {
    label: t('domain_name'),
    props: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: dynDomains,
    },
  },

  dynDomainPassword: {
    label: t('domain.add.dyn_dns_password'),
    description: t('domain.add.dyn_dns_password_desc'),
    props: {
      id: 'dyn-dns-password',
      placeholder: '••••••••',
      type: 'password',
    },
  },

  dynDomainPasswordConfirmation: {
    label: t('password_confirmation'),
    props: {
      id: 'dyn-dns-password-confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  },

  localDomain: {
    label: t('domain_name'),
    props: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: ['local', 'test'],
    },
  },
}

const domainIsVisible = computed(() => {
  return selected.value === 'domain'
})

const dynDomainIsVisible = computed(() => {
  return selected.value === 'dynDomain'
})

const localDomainIsVisible = computed(() => {
  return selected.value === 'localDomain'
})

async function onSubmit() {
  const domainType = selected.value
  const data = await formatFormData({
    domain: form[domainType],
    dyndns_recovery_password:
      domainType === 'dynDomain' ? form.dynDomainPassword : '',
  })
  emit('submit', data)
}
</script>

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
        <span class="ps-1" v-html="$t('domain.add.from_registrar_desc')" />
      </p>

      <FormField
        v-bind="fields.domain"
        v-model="form.domain"
        :validation="v$.domain"
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
        <span class="ps-1" v-html="$t('domain.add.from_yunohost_desc')" />
      </p>

      <FormField
        v-bind="fields.dynDomain"
        :validation="v$.dynDomain"
        class="mt-3"
      >
        <template #default="{ self }">
          <AdressInputSelect v-bind="self" v-model="form.dynDomain" />
        </template>
      </FormField>

      <FormField
        v-bind="fields.dynDomainPassword"
        :validation="v$.dynDomainPassword"
        v-model="form.dynDomainPassword"
      />

      <FormField
        v-bind="fields.dynDomainPasswordConfirmation"
        :validation="v$.dynDomainPasswordConfirmation"
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
        <span class="ps-1" v-html="$t('domain.add.from_local_desc')" />
      </p>

      <FormField
        v-bind="fields.localDomain"
        :validation="v$.localDomain"
        class="mt-3"
      >
        <template #default="{ self }">
          <AdressInputSelect v-bind="self" v-model="form.localDomain" />
        </template>
      </FormField>
    </BCollapse>
  </CardForm>
</template>
