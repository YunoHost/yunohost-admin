<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { useDomains, useUsersAndGroups } from '@/composables/data'
import { useForm } from '@/composables/form'
import { useInitialQueries } from '@/composables/useInitialQueries'
import {
  alphalownumdot_,
  minLength,
  name,
  required,
  sameAs,
  unique,
} from '@/helpers/validators'
import { formatForm } from '@/helpers/yunohostArguments'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const router = useRouter()
const { loading } = useInitialQueries(
  [
    { uri: 'users', cachePath: 'users' },
    { uri: 'domains', cachePath: 'domains' },
  ],
  { onQueriesResponse },
)
const { usernames } = useUsersAndGroups()
const { domainsAsChoices, mainDomain } = useDomains()

type Form = typeof form.value
const form = ref({
  username: '',
  fullname: '',
  domain: mainDomain.value,
  password: '',
  confirmation: '',
})
const fields = {
  username: reactive({
    component: 'InputItem',
    label: t('user_username'),
    rules: computed(() => ({
      required,
      alphalownumdot_,
      notInUsers: unique(usernames),
    })),
    cProps: {
      id: 'username',
      placeholder: t('placeholder.username'),
    },
  }) satisfies FieldProps<'InputItem', Form['username']>,

  fullname: {
    component: 'InputItem',
    hr: true,
    label: t('user_fullname'),
    rules: { required, name },
    cProps: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  } satisfies FieldProps<'InputItem', Form['fullname']>,

  domain: reactive({
    component: 'SelectItem',
    hr: true,
    id: 'mail',
    label: t('user_email'),
    description: t('tip_about_user_email'),
    descriptionVariant: 'info',
    rules: { required },
    cProps: { choices: domainsAsChoices },
  }) satisfies FieldProps<'SelectItem', Form['domain']>,

  password: {
    component: 'InputItem',
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    rules: { required, passwordLenght: minLength(8) },
    cProps: {
      id: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  } satisfies FieldProps<'InputItem', Form['password']>,

  confirmation: reactive({
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: computed(() => ({
      required,
      passwordMatch: sameAs(form.value.password),
    })),
    cProps: {
      id: 'confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  }) satisfies FieldProps<'InputItem', Form['confirmation']>,
} satisfies FormFieldDict<Form>

const { v, onSubmit } = useForm(form, fields)

function onQueriesResponse() {
  form.value.domain = mainDomain.value
}

const onUserCreate = onSubmit(async (onError) => {
  const data = await formatForm(form)
  api
    .post({
      uri: 'users',
      cachePath: 'users',
      data,
      humanKey: { key: 'users.create', name: form.value.username },
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
