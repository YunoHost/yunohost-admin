<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, APIError } from '@/api/errors'
import { alphalownumdot_, required } from '@/helpers/validators'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ groupname: '' })
const v$ = useVuelidate({ groupname: { required, alphalownumdot_ } }, form)
const serverError = ref('')
const groupnameField = {
  label: t('group_name'),
  description: t('group_format_name_help'),
  props: {
    id: 'groupname',
    placeholder: t('placeholder.groupname'),
  },
}
function onSubmit() {
  api
    .post({ uri: 'users/groups', storeKey: 'groups' }, form, {
      key: 'groups.create',
      name: form.groupname,
    })
    .then(() => {
      router.push({ name: 'group-list' })
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      serverError.value = err.message
    })
}
</script>

<template>
  <CardForm
    :title="$t('group_new')"
    icon="users"
    :validation="v$"
    :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <!-- GROUP NAME -->
    <FormField
      v-bind="groupnameField"
      v-model="form.groupname"
      :validation="v$.form.groupname"
    />
  </CardForm>
</template>
