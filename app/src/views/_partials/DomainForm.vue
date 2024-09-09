<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useDomains } from '@/composables/data'
import { useForm } from '@/composables/form'
import {
  domain,
  dynDomain,
  minLength,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatFormValue } from '@/helpers/yunohostArguments'
import type { AdressModelValue, FieldProps, FormFieldDict } from '@/types/form'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    title: string
    postinstall?: boolean
    submitText?: string
    serverError?: string
  }>(),
  {
    postinstall: false,
    submitText: undefined,
    serverError: undefined,
  },
)
const emit = defineEmits<{
  submit: [
    data: {
      domain: string
      dyndns_recovery_password?: string
      install_letsencrypt_cert?: boolean
    },
  ]
}>()

const { domains, domainsAsChoices } = !props.postinstall
  ? useDomains()
  : { domains: ref([] as string[]), domainsAsChoices: ref([] as string[]) }
const domainsCertsReady: Record<string, boolean> = !props.postinstall
  ? await api
      .fetchAll(
        domains.value.map((domain) => ({ uri: `domains/${domain}/cert?full` })),
      )
      .then((certs) => {
        return certs.reduce(
          (acc, cert, i) => {
            const domain = domains.value[i]
            acc[domain] = cert.certificates[domain].has_wildcards
            return acc
          },
          {} as Record<string, boolean>,
        )
      })
  : {}

const { t } = useI18n()
const dynDomains = ['nohost.me', 'noho.st', 'ynh.fr']

const dynDnsForbiden = computed(() => {
  if (!domains.value) return false
  return domains.value.some((domain) => {
    return dynDomains.some((dynDomain) => domain.includes(dynDomain))
  })
})

type Selected = 'domain' | 'subDomain' | 'dynDomain' | 'localDomain'
const selected = ref<'' | Selected>(dynDnsForbiden.value ? 'domain' : '')

type Form = {
  domain: string
  subDomain: AdressModelValue
  certInstall: boolean
  dynDomain: AdressModelValue
  dynDomainPassword: string
  dynDomainPasswordConfirmation: string
  localDomain: AdressModelValue
}
const form = ref<Form>({
  domain: '',
  subDomain: { localPart: '', separator: '.', domain: domains.value[0] },
  certInstall: false,
  dynDomain: { localPart: '', separator: '.', domain: 'nohost.me' },
  dynDomainPassword: '',
  dynDomainPasswordConfirmation: '',
  localDomain: { localPart: '', separator: '.', domain: 'local' },
})
const fields = {
  domain: reactive({
    component: 'InputItem',
    label: t('domain_name'),
    rules: computed(() => {
      return selected.value === 'domain' ? { required, domain } : undefined
    }),
    cProps: {
      id: 'domain',
      placeholder: t('placeholder.domain'),
    },
  }) satisfies FieldProps<'InputItem', Form['domain']>,

  subDomain: reactive({
    component: 'AdressItem',
    label: t('domain_name'),
    rules: computed(() => {
      return selected.value === 'subDomain'
        ? { localPart: { required, dynDomain }, domain: { required } }
        : undefined
    }),
    cProps: {
      id: 'sub-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: domainsAsChoices,
    },
  }) satisfies FieldProps<'AdressItem', Form['subDomain']>,

  certInstall: reactive({
    component: 'CheckboxItem',
    label: t('domain.cert.install'),
    cProps: {
      id: 'cert-install',
    },
    visible: computed(() => {
      return (
        !!form.value.subDomain.domain &&
        domainsCertsReady[form.value.subDomain.domain]
      )
    }),
  }) satisfies FieldProps<'CheckboxItem', Form['certInstall']>,

  dynDomain: reactive({
    component: 'AdressItem',
    label: t('domain_name'),
    rules: computed(() => {
      return selected.value === 'dynDomain'
        ? { localPart: { required, dynDomain }, domain: { required } }
        : undefined
    }),
    cProps: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: dynDomains,
    },
  }) satisfies FieldProps<'AdressItem', Form['dynDomain']>,

  dynDomainPassword: reactive({
    component: 'InputItem',
    label: t('domain.add.dyn_dns_password'),
    description: t('domain.add.dyn_dns_password_desc'),
    rules: computed(() => {
      return selected.value === 'dynDomain'
        ? { required, passwordLenght: minLength(8) }
        : undefined
    }),
    cProps: {
      id: 'dyn-dns-password',
      placeholder: '••••••••',
      type: 'password',
    },
  }) satisfies FieldProps<'InputItem', Form['dynDomainPassword']>,

  dynDomainPasswordConfirmation: reactive({
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: computed(() => ({
      passwordMatch: sameAs(form.value.dynDomainPassword),
    })),
    cProps: {
      id: 'dyn-dns-password-confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  }) satisfies FieldProps<'InputItem', Form['dynDomainPasswordConfirmation']>,

  localDomain: reactive({
    component: 'AdressItem',
    label: t('domain_name'),
    rules: computed(() =>
      selected.value === 'localDomain'
        ? { localPart: { required, dynDomain }, domain: { required } }
        : undefined,
    ),
    cProps: {
      id: 'dyn-domain',
      placeholder: t('placeholder.domain').split('.')[0],
      type: 'domain',
      choices: ['local', 'test'],
    },
  }) satisfies FieldProps<'AdressItem', Form['localDomain']>,
} satisfies FormFieldDict<Form>

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

const subDomainIsVisible = computed(() => {
  return selected.value === 'subDomain'
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
  const domain = await formatFormValue(form.value[domainType])

  emit('submit', {
    domain,
    dyndns_recovery_password:
      domainType === 'dynDomain' ? form.value.dynDomainPassword : undefined,
    install_letsencrypt_cert:
      domainType === 'subDomain' && fields.certInstall.visible
        ? form.value.certInstall
        : undefined,
  })
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
        :validation="v.form.domain"
      />
    </BCollapse>

    <BFormRadio
      v-if="domainsCertsReady"
      v-model="selected"
      name="domain-type"
      value="subDomain"
      :class="subDomainIsVisible ? null : 'collapsed'"
      :aria-expanded="subDomainIsVisible ? 'true' : 'false'"
      aria-controls="collapse-subDomain"
      class="mb-2"
    >
      {{ $t('domain.add.from_subdomain') }}
    </BFormRadio>

    <BCollapse
      v-if="!postinstall"
      id="collapse-subDomain"
      v-model="subDomainIsVisible"
    >
      <p class="mt-2 mb-3 alert alert-info">
        <YIcon iname="info-circle" />
        <span class="ps-1" v-html="$t('domain.add.from_subdomain_desc')" />
      </p>

      <FormField
        v-bind="fields.subDomain"
        v-model="form.subDomain"
        :validation="v.form.subDomain"
      />

      <FormField
        v-if="fields.certInstall.visible"
        v-bind="fields.certInstall"
        v-model="form.certInstall"
        :validation="v.form.certInstall"
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
        :validation="v.form[key]"
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
        :validation="v.form.localDomain"
      />
    </BCollapse>
  </CardForm>
</template>
