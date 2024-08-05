<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import { resetCache } from '@/composables/data'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { required } from '@/helpers/validators'
import { formatForm } from '@/helpers/yunohostArguments'
import type { FieldProps, FileModelValue, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

type Form = typeof form.value
const form = ref({
  csvfile: { file: null } as FileModelValue,
  update: false,
  delete: false,
})
const fields = reactive({
  csvfile: {
    component: 'FileItem',
    label: t('users_import_csv_file'),
    description: t('users_import_csv_file_desc'),
    rules: { file: required },
    props: {
      id: 'csvfile',
      accept: 'text/csv',
      placeholder: t('placeholder.file'),
    },
  } satisfies FieldProps<'FileItem', Form['csvfile']>,

  update: {
    label: t('users_import_update'),
    description: t('users_import_update_desc'),
    component: 'CheckboxItem',
    props: {
      id: 'update',
    },
  } satisfies FieldProps<'CheckboxItem', Form['update']>,

  delete: {
    component: 'CheckboxItem',
    label: t('users_import_delete'),
    description: t('users_import_delete_desc'),
    props: {
      id: 'delete',
    },
  } satisfies FieldProps<'CheckboxItem', Form['delete']>,
} satisfies FormFieldDict<Form>)

const { v, onSubmit } = useForm(form, fields)

const onUserImport = onSubmit(async (onError) => {
  if (form.value.delete) {
    const confirmed = await modalConfirm(
      t('users_import_confirm_destructive'),
      { okTitle: t('users_import_delete_others') },
    )
    if (!confirmed) return
  }

  const requestArgs = { ...form.value } as Partial<Form>
  if (!requestArgs.delete) delete requestArgs.delete
  if (!requestArgs.update) delete requestArgs.update
  const data = await formatForm(requestArgs)

  api
    .post({ uri: 'users/import', data })
    .then(() => {
      // Reset all cached data related to users.
      resetCache(['users', 'userDetails', 'groups', 'permissions'])
      router.push({ name: 'user-list' })
    })
    .catch(onError)
})
</script>

<template>
  <CardForm
    v-model="form"
    icon="user-plus"
    :fields="fields"
    :title="$t('users_import')"
    :validations="v"
    @submit.prevent="onUserImport"
  />
</template>
