<template>
    <div>
  <card-form
    :title="$t('users_import')" icon="user-plus"
    :validation="$v" :server-error="serverError"
    @submit.prevent="beforeImport"
  >
    <!-- CSV FILE -->
    <form-field component="FileItem" v-bind="fields.csv" v-model="form.csv"
                :validation="$v.form.csv" accept=".csv" />
    <!-- UPDATE -->
    <form-field component="CheckboxItem" v-bind="fields.update" v-model="form.update"
                :validation="$v.form.update" />
    <!-- DELETE -->
    <form-field component="CheckboxItem" v-bind="fields.delete" v-model="form.delete"
                :validation="$v.form.delete" />
  </card-form>
    <!-- CONFIRM DESTRUCTIVE IMPORT MODAL -->
    <b-modal
    id="confirm-destructive-import-modal" ref="confirm-destructive-import-modal" centered
    body-bg-variant="danger" body-text-variant="light"
    @ok="onSubmit" hide-header
    :ok-title="$t('users_import_delete_others')"
    >
    {{ $t('users_import_confirm_destructive') }}
    </b-modal>
    </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import { formatFormData } from '@/helpers/yunohostArguments'
import {
  required
} from '@/helpers/validators'


export default {
  name: 'UserImport',

  mixins: [validationMixin],

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
          props: {
            id: 'csv',
            placeholder: this.$i18n.t('placeholder.file')
          }
        },
        update: {
          label: this.$i18n.t('users_import_update'),
          description: this.$i18n.t('users_import_update_desc'),
          props: {
            id: 'update'
          }
        },
        delete: {
          label: this.$i18n.t('users_import_delete'),
          description: this.$i18n.t('users_import_delete_desc'),
          props: {
            id: 'delete'
          }
        }
      }
    }
  },

  validations () {
    return {
      form: {
        csv: { required },
        update: { },
        delete: { }
      }
    }
  },

  methods: {
    beforeImport () {
      if (this.form.delete) {
        this.$refs['confirm-destructive-import-modal'].show()
      } else {
        this.onSubmit()
      }
    },

    onSubmit () {
      const data = formatFormData(this.form, { flatten: true })
      this.$store.dispatch(
        'POST', { uri: 'users/import', data }
      ).then(() => {
        this.$router.push({ name: 'user-list' })
      }).catch(error => {
        this.serverError = error.message
      })
    }
  },

  created () {
  }
}
</script>
