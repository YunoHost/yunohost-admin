<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useForm } from '@/composables/form'
import { asUnreffed } from '@/helpers/commons'
import {
  domain,
  dynDomain,
  minLength,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatFormData } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'
import type { AdressModelValue, FieldProps, FormFieldDict } from '@/types/form'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    title: string
    submitText?: string
    serverError?: string
  }>(),
  {
    submitText: undefined,
    serverError: undefined,
  },
)
const emit = defineEmits<{
  submit: [data: { domain: string; dyndns_recovery_password: string }]
}>()

const { t } = useI18n()

const { domains } = useStoreGetters()
const dynDomains = ['nohost.me', 'noho.st', 'ynh.fr']

const dynDnsForbiden = computed(() => {
  if (!domains.value) return false
  return domains.value.some((domain) => {
    return dynDomains.some((dynDomain) => domain.includes(dynDomain))
  })
})

type Selected = 'domain' | 'dynDomain' | 'localDomain'
const selected = ref<'' | Selected>(dynDnsForbiden.value ? 'domain' : '')

type Form = {
  domain: string
  dynDomain: AdressModelValue
  dynDomainPassword: string
  dynDomainPasswordConfirmation: string
  localDomain: AdressModelValue
}
const form = ref<Form>({
  domain: '',
  dynDomain: { localPart: '', separator: '.', domain: 'nohost.me' },
  dynDomainPassword: '',
  dynDomainPasswordConfirmation: '',
  localDomain: { localPart: '', separator: '.', domain: 'local' },
})
const fields = reactive({
  domain: {
    component: 'InputItem',
    label: t('domain_name'),
    rules: asUnreffed(
      computed(() =>
        selected.value === 'domain' ? { required, domain } : undefined,
      ),
    ),
    props: {
      id: 'domain',
      placeholder: t('placeholder.domain'),
    },
  } satisfies FieldProps<'InputItem', Form['domain']>,

  dynDomain: {
    component: 'AdressItem',
    label: t('domain_name'),
    rules: { localPart: { required, dynDomain } },
    props: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: dynDomains,
    },
  } satisfies FieldProps<'AdressItem', Form['dynDomain']>,

  dynDomainPassword: {
    component: 'InputItem',
    label: t('domain.add.dyn_dns_password'),
    description: t('domain.add.dyn_dns_password_desc'),
    rules: { passwordLenght: minLength(8) },
    props: {
      id: 'dyn-dns-password',
      placeholder: '••••••••',
      type: 'password',
    },
  } satisfies FieldProps<'InputItem', Form['dynDomainPassword']>,

  dynDomainPasswordConfirmation: {
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: asUnreffed(
      computed(() => ({
        passwordMatch: sameAs(form.value.dynDomainPassword),
      })),
    ),
    props: {
      id: 'dyn-dns-password-confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  } satisfies FieldProps<'InputItem', Form['dynDomainPasswordConfirmation']>,

  localDomain: {
    component: 'AdressItem',
    label: t('domain_name'),
    rules: asUnreffed(
      computed(() =>
        selected.value === 'localDomain'
          ? { localPart: { required, dynDomain } }
          : undefined,
      ),
    ),
    props: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: ['local', 'test'],
    },
  } satisfies FieldProps<'AdressItem', Form['localDomain']>,
} satisfies FormFieldDict<Form>)

const { v, onSubmit, serverErrors } = useForm(form, fields)

watch(
  () => props.serverError,
  () => {
    if (props.serverError) {
      serverErrors.global = [props.serverError]
    }
  },
)

const dynKeys = [
  'dynDomain',
  'dynDomainPassword',
  'dynDomainPasswordConfirmation',
] as (keyof Form)[]

const domainIsVisible = computed(() => {
  return selected.value === 'domain'
})

const dynDomainIsVisible = computed(() => {
  return selected.value === 'dynDomain'
})

const localDomainIsVisible = computed(() => {
  return selected.value === 'localDomain'
})

const onDomainAdd = onSubmit(async () => {
  const domainType = selected.value
  if (!domainType) return

  const data = await formatFormData({
    domain: form.value[domainType],
    dyndns_recovery_password:
      domainType === 'dynDomain' ? form.value.dynDomainPassword : '',
  })
  emit('submit', data)
})
</script>

<template>
  <CardForm
    :title="title"
    icon="globe"
    :submit-text="submitText"
    :validations="v"
    @submit.prevent="onDomainAdd"
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

    <BCollapse id="collapse-domain" v-model="domainIsVisible">
      <p class="mt-2 mb-3 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="ps-1" v-html="$t('domain.add.from_registrar_desc')" />
      </p>

      <FormField
        v-bind="fields.domain"
        v-model="form.domain"
        :validation="v.domain"
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

    <BCollapse id="collapse-dynDomain" v-model="dynDomainIsVisible">
      <p class="mt-2 mb-3 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="ps-1" v-html="$t('domain.add.from_yunohost_desc')" />
      </p>

      <FormField
        v-for="key in dynKeys"
        :key="key"
        v-bind="fields[key]"
        v-model="form[key]"
        :validation="v[key]"
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

    <BCollapse id="collapse-localDomain" v-model="localDomainIsVisible">
      <p class="mt-2 mb-3 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="ps-1" v-html="$t('domain.add.from_local_desc')" />
      </p>

      <FormField
        v-bind="fields.localDomain"
        v-model="form.localDomain"
        :validation="v.localDomain"
      />
    </BCollapse>
  </CardForm>
</template>
