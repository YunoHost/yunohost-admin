<template>
  <card-form
    :title="$t('users_import')" icon="user-plus"
    :validation="$v" :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <!-- CSV FILE -->
    <form-field v-bind="fields.csv" v-model="form.csv" :validation="$v.form.csv" />

    <!-- UPDATE -->
    <form-field v-bind="fields.update" v-model="form.update" />

    <!-- DELETE -->
    <form-field v-bind="fields.delete" v-model="form.delete" />
  </card-form>
</template>

<script>
import api from '@/api'
import { validationMixin } from 'vuelidate'

import { formatFormData } from '@/helpers/yunohostArguments'
import { required, fileMediaTypeMatch } from '@/helpers/validators'

export default {
  name: 'UserImport',

  data () {
    return {
      form: {
        csv: '',
        update: false,
        delete: false
      },

      serverError: '',

      fields: {
        csv: {
          label: this.$i18n.t('users_import_csv_file'),
          description: this.$i18n.t('users_import_csv_file_desc'),
          component: 'FileItem',
          props: {
            id: 'csv',
            placeholder: this.$i18n.t('placeholder.file')
          }
        },

        update: {
          label: this.$i18n.t('users_import_update'),
          description: this.$i18n.t('users_import_update_desc'),
          component: 'CheckboxItem',
          props: {
            id: 'update'
          }
        },

        delete: {
          label: this.$i18n.t('users_import_delete'),
          description: this.$i18n.t('users_import_delete_desc'),
          component: 'CheckboxItem',
          props: {
            id: 'delete'
          }
        }
      }
    }
  },

  validations: {
    form: {
      csv: { required, fileMediaTypeMatch: fileMediaTypeMatch('text/csv') }
    }
  },

  methods: {
    async onSubmit () {
      if (this.form.delete) {
        const confirmed = await this.$askConfirmation(
          this.$i18n.t('users_import_confirm_destructive'),
          { okTitle: this.$i18n.t('users_import_delete_others') }
        )
        if (!confirmed) return
      }

      const data = formatFormData(this.form)
      api.post('users/import', data, { asFormData: true }).then(() => {
        // Reset all cached data related to users.
        this.$store.dispatch('RESET_CACHE_DATA', ['users', 'users_details', 'groups', 'permissions'])
        this.$router.push({ name: 'user-list' })
      }).catch(error => {
        this.serverError = error.message
      })
    }
  },

  mixins: [validationMixin]
}
</script>
