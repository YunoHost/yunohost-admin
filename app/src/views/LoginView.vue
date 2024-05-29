<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, type LocationQueryValue } from 'vue-router'
import { useStore } from 'vuex'

import { alphalownumdot_, minLength, required } from '@/helpers/validators'
import { useStoreGetters } from '@/store/utils'

const props = withDefaults(
  defineProps<{
    forceReload?: boolean
  }>(),
  {
    forceReload: false,
  },
)

const { t } = useI18n()
const store = useStore()
const router = useRouter()

const { installed } = useStoreGetters()
const serverError = ref('')
const form = reactive({
  username: '',
  password: '',
})
const v$ = useVuelidate(
  {
    username: { required, alphalownumdot_ },
    password: { required, passwordLenght: minLength(4) },
  },
  form,
)

console.log(v$.value)

const fields = {
  username: {
    label: t('user_username'),
    props: {
      id: 'username',
      autocomplete: 'username',
    },
  },
  password: {
    label: t('password'),
    props: {
      id: 'password',
      type: 'password',
      autocomplete: 'current-password',
    },
  },
}

function login() {
  const credentials = [form.username, form.password].join(':')
  store
    .dispatch('LOGIN', credentials)
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
    .catch((err) => {
      if (err.name !== 'APIUnauthorizedError') throw err
      serverError.value = t('wrong_password_or_username')
    })
}
</script>

<template>
  <CardForm
    :title="t('login')"
    icon="lock"
    :validation="v$"
    :server-error="serverError"
    @submit.prevent="login"
  >
    <!-- ADMIN USERNAME -->
    <FormField
      v-bind="fields.username"
      v-model="form.username"
      :validation="v$.username"
    />

    <!-- ADMIN PASSWORD -->
    <FormField
      v-bind="fields.password"
      v-model="form.password"
      :validation="v$.password"
    />

    <template #buttons>
      <BButton
        type="submit"
        variant="success"
        :disabled="!installed"
        form="ynh-form"
      >
        {{ t('login') }}
      </BButton>
    </template>
  </CardForm>
</template>
