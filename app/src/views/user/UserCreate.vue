<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import {
  alphalownumdot_,
  minLength,
  name,
  required,
  sameAs,
  unique,
} from '@/helpers/validators'
import { formatFormData } from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'

const { t } = useI18n()
const router = useRouter()

const queries = [
  ['GET', { uri: 'users' }],
  ['GET', { uri: 'domains' }],
]
const { userNames, domainsAsChoices, mainDomain } = useStoreGetters()

const fields = {
  username: {
    label: t('user_username'),
    props: {
      id: 'username',
      placeholder: t('placeholder.username'),
    },
  },

  fullname: {
    label: t('user_fullname'),
    props: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  },

  domain: {
    id: 'mail',
    label: t('user_email'),
    description: t('tip_about_user_email'),
    descriptionVariant: 'info',
    props: { choices: domainsAsChoices },
  },

  password: {
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    props: {
      id: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  },

  confirmation: {
    label: t('password_confirmation'),
    props: {
      id: 'confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  },
}
const form = reactive({
  username: '',
  fullname: '',
  domain: '',
  password: '',
  confirmation: '',
})
const rules = computed(() => ({
  username: {
    required,
    alphalownumdot_,
    notInUsers: unique(userNames.value),
  },
  fullname: { required, name },
  domain: { required },
  password: { required, passwordLenght: minLength(8) },
  confirmation: { required, passwordMatch: sameAs(form.password) },
}))
const v$ = useVuelidate(rules, form)
const serverError = ref('')

function onQueriesResponse() {
  form.domain = mainDomain.value
}

async function onSubmit() {
  const data = await formatFormData(form, { flatten: true })
  api
    .post({ uri: 'users' }, data, {
      key: 'users.create',
      name: form.username,
    })
    .then(() => {
      router.push({ name: 'user-list' })
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      serverError.value = err.message
    })
}
</script>

<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardFormSkeleton"
  >
    <CardForm
      :title="$t('users_new')"
      icon="user-plus"
      :validation="v$"
      :server-error="serverError"
      @submit.prevent="onSubmit"
    >
      <!-- USER NAME -->
      <FormField
        v-bind="fields.username"
        v-model="form.username"
        :validation="v$.form.username"
      />

      <!-- USER FULLNAME -->
      <FormField
        v-bind="fields.fullname"
        :validation="v$.form.fullname"
        v-model="form.fullname"
      />
      <hr />

      <!-- USER MAIL DOMAIN -->
      <FormField v-bind="fields.domain" :validation="v$.form.domain">
        <template #default="{ self }">
          <BInputGroup>
            <BInputGroupText id="local-part" tag="label" class="border-right-0">
              {{ form.username }}@
            </BInputGroupText>

            <SelectItem
              aria-labelledby="local-part"
              aria-describedby="mail__BV_description_"
              v-model="form.domain"
              v-bind="self"
            />
          </BInputGroup>
        </template>
      </FormField>
      <hr />

      <!-- USER PASSWORD -->
      <FormField
        v-bind="fields.password"
        v-model="form.password"
        :validation="v$.form.password"
      />

      <!-- USER PASSWORD CONFIRMATION -->
      <FormField
        v-bind="fields.confirmation"
        v-model="form.confirmation"
        :validation="v$.form.confirmation"
      />
    </CardForm>
  </ViewBase>
</template>
