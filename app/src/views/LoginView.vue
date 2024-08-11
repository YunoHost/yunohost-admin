<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, type LocationQueryValue } from 'vue-router'

import { useForm } from '@/composables/form'
import { useInfos } from '@/composables/useInfos'
import { alphalownumdot_, minLength, required } from '@/helpers/validators'
import type { FieldProps, FormFieldDict } from '@/types/form'

const props = withDefaults(
  defineProps<{
    forceReload?: boolean
  }>(),
  {
    forceReload: false,
  },
)

const { t } = useI18n()
const router = useRouter()
const { login, installed } = useInfos()

type Form = typeof form.value
const form = ref({
  username: '',
  password: '',
})
const fields = {
  username: {
    component: 'InputItem',
    label: t('user_username'),
    rules: { required, alphalownumdot_ },
    cProps: {
      id: 'username',
      autocomplete: 'username',
    },
  } satisfies FieldProps<'InputItem', Form['username']>,

  password: {
    component: 'InputItem',
    label: t('password'),
    rules: { required, passwordLenght: minLength(4) },
    cProps: {
      id: 'password',
      type: 'password',
      autocomplete: 'current-password',
    },
  } satisfies FieldProps<'InputItem', Form['password']>,
} satisfies FormFieldDict<Form>

const { v, onSubmit } = useForm(form, fields)

const onLogin = onSubmit((onError) => {
  const { username, password } = form.value
  const credentials = [username, password].join(':')
  login(credentials)
    .then(() => {
      if (props.forceReload) {
        window.location.href = '/yunohost/admin/'
      } else {
        router.push(
          (router.currentRoute.value.query.redirect as LocationQueryValue) || {
            name: 'home',
          },
        )
      }
    })
    .catch((err) => onError(err, t('wrong_password_or_username')))
})
</script>

<template>
  <CardForm
    id="login-form"
    v-model="form"
    :fields="fields"
    icon="lock"
    :title="t('login')"
    :validations="v"
    @submit="onLogin"
  >
    <template #buttons>
      <!-- FIXME should we remove the disabled state? -->
      <BButton
        type="submit"
        variant="success"
        :disabled="!installed"
        form="login-form"
      >
        {{ t('login') }}
      </BButton>
    </template>
  </CardForm>
</template>
