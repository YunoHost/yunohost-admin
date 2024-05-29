<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { formatFormData } from '@/helpers/yunohostArguments'
import { useVuelidate } from '@vuelidate/core'

const { t } = useI18n()
const router = useRouter()
const store = useStore()
const modalConfirm = useAutoModal()

const fields = {
  csvfile: {
    label: t('users_import_csv_file'),
    description: t('users_import_csv_file_desc'),
    component: 'FileItem',
    props: {
      id: 'csvfile',
      accept: 'text/csv',
      placeholder: t('placeholder.file'),
    },
  },

  update: {
    label: t('users_import_update'),
    description: t('users_import_update_desc'),
    component: 'CheckboxItem',
    props: {
      id: 'update',
    },
  },

  delete: {
    label: t('users_import_delete'),
    description: t('users_import_delete_desc'),
    component: 'CheckboxItem',
    props: {
      id: 'delete',
    },
  },
}
const form = reactive({
  csvfile: { file: null },
  update: false,
  delete: false,
})
const rules = computed(() => ({}))
const v$ = useVuelidate(rules, form)
const serverError = ref('')

async function onSubmit() {
  if (form.delete) {
    const confirmed = await modalConfirm(
      t('users_import_confirm_destructive'),
      { okTitle: t('users_import_delete_others') },
    )
    if (!confirmed) return
  }

  const requestArgs = { ...form } as Partial<typeof form>
  if (!requestArgs.delete) delete requestArgs.delete
  if (!requestArgs.update) delete requestArgs.update
  const data = await formatFormData(requestArgs)
  api
    .post('users/import', data, null, { asFormData: true })
    .then(() => {
      // Reset all cached data related to users.
      store.dispatch('RESET_CACHE_DATA', [
        'users',
        'users_details',
        'groups',
        'permissions',
      ])
      router.push({ name: 'user-list' })
    })
    .catch((error) => {
      serverError.value = error.message
    })
}
</script>

<template>
  <CardForm
    :title="$t('users_import')"
    icon="user-plus"
    :validation="v$"
    :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <!-- CSV FILE -->
    <FormField
      v-bind="fields.csvfile"
      v-model="form.csvfile"
      :validation="v$.form.csvfile"
    />

    <!-- UPDATE -->
    <FormField v-bind="fields.update" v-model="form.update" />

    <!-- DELETE -->
    <FormField v-bind="fields.delete" v-model="form.delete" />
  </CardForm>
</template>
