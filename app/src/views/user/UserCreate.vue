<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { useForm } from '@/composables/form'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { asUnreffed } from '@/helpers/commons'
import {
  alphalownumdot_,
  minLength,
  name,
  required,
  sameAs,
  unique,
} from '@/helpers/validators'
import { formatForm } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const router = useRouter()
const { loading } = useInitialQueries(
  [
    ['GET', { uri: 'users' }],
    ['GET', { uri: 'domains' }],
  ],
  { onQueriesResponse },
)

const { userNames, domainsAsChoices, mainDomain } = useStoreGetters()

type Form = typeof form.value
const form = ref({
  username: '',
  fullname: '',
  domain: '',
  password: '',
  confirmation: '',
})
const fields = {
  username: {
    component: 'InputItem',
    label: t('user_username'),
    rules: asUnreffed(
      computed(() => ({
        required,
        alphalownumdot_,
        notInUsers: unique(userNames),
      })),
    ),
    props: {
      id: 'username',
      placeholder: t('placeholder.username'),
    },
  } satisfies FieldProps<'InputItem', Form['username']>,

  fullname: {
    component: 'InputItem',
    hr: true,
    label: t('user_fullname'),
    rules: { required, name },
    props: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  } satisfies FieldProps<'InputItem', Form['fullname']>,

  domain: {
    component: 'SelectItem',
    hr: true,
    id: 'mail',
    label: t('user_email'),
    description: t('tip_about_user_email'),
    descriptionVariant: 'info',
    rules: { required },
    props: { choices: asUnreffed(domainsAsChoices) },
  } satisfies FieldProps<'SelectItem', Form['domain']>,

  password: {
    component: 'InputItem',
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    rules: { required, passwordLenght: minLength(8) },
    props: {
      id: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  } satisfies FieldProps<'InputItem', Form['password']>,

  confirmation: {
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: asUnreffed(
      computed(() => ({
        required,
        passwordMatch: sameAs(form.value.password),
      })),
    ),
    props: {
      id: 'confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  } satisfies FieldProps<'InputItem', Form['confirmation']>,
} satisfies FormFieldDict<Form>

const { v, onSubmit } = useForm(form, fields)

function onQueriesResponse() {
  form.value.domain = mainDomain.value
}

const onUserCreate = onSubmit(async (onError) => {
  const data = await formatForm(form)
  api
    .post({ uri: 'users' }, data, {
      key: 'users.create',
      name: form.value.username,
    })
    .then(() => {
      router.push({ name: 'user-list' })
    })
    .catch(onError)
})
</script>

<template>
  <ViewBase :loading="loading" skeleton="CardFormSkeleton">
    <CardForm
      v-model="form"
      icon="user-plus"
      :fields="fields"
      :title="$t('users_new')"
      :validations="v"
      @submit.prevent="onUserCreate"
    >
      <template #component:domain="componentProps">
        <BInputGroup>
          <BInputGroupText id="local-part" tag="label" class="border-right-0">
            {{ form.username }}@
          </BInputGroupText>

          <SelectItem v-bind="componentProps" v-model="form.domain" />
        </BInputGroup>
      </template>
    </CardForm>
  </ViewBase>
</template>
