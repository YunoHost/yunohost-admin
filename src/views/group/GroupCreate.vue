<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { useForm } from '@/composables/form'
import { alphalownumdot_, required } from '@/helpers/validators'
import type { FieldProps, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const router = useRouter()

const form = ref({ groupname: '' })
const fields = {
  groupname: {
    component: 'InputItem',
    label: t('group_name'),
    description: t('group_format_name_help'),
    rules: { required, alphalownumdot_ },
    cProps: {
      id: 'groupname',
      placeholder: t('placeholder.groupname'),
    },
  } satisfies FieldProps<'InputItem', string>,
} satisfies FormFieldDict<typeof form.value>

const { v, onSubmit } = useForm(form, fields)

const onAddGroup = onSubmit((onError) => {
  api
    .post({ uri: 'users/groups', cachePath: 'groups', data: form.value })
    .then(() => {
      router.push({ name: 'group-list' })
    })
    .catch(onError)
})
</script>

<template>
  <CardForm
    v-model="form"
    icon="users"
    :fields="fields"
    :title="$t('group_add')"
    :validations="v"
    @submit.prevent="onAddGroup"
  />
</template>
