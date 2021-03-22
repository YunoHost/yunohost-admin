<template>
  <password-form
    :title="$t('postinstall_set_password')"
    :server-error="serverError"
    @submit="onSubmit"
    :extra="extra"
  />
</template>

<script>
import api from '@/api'
import { validationMixin } from 'vuelidate'

import { PasswordForm } from '@/views/_partials'
import { required, minLength } from '@/helpers/validators'

export default {
  name: 'ToolAdminpw',

  data () {
    return {
      serverError: '',

      extra: {
        form: {
          currentPassword: ''
        },
        fields: {
          currentPassword: {
            label: this.$i18n.t('tools_adminpw_current'),
            description: this.$i18n.t('tools_adminpw_current_placeholder'),
            props: { id: 'current-password', type: 'password', placeholder: '••••••••' }
          }
        },
        validations: {
          currentPassword: { required, passwordLenght: minLength(8) }
        }
      }
    }
  },

  methods: {
    onSubmit ({ currentPassword, password }) {
      this.serverError = ''

      api.fetchAll(
        [['POST', 'login', { password: currentPassword }, { websocket: false }],
         ['PUT', 'adminpw', { new_password: password }]],
        { wait: true }
      ).then(() => {
        this.$store.dispatch('DISCONNECT')
      }).catch(err => {
        if (err.name === 'APIUnauthorizedError') {
          // Prevent automatic disconnect if error in current password.
          this.serverError = this.$i18n.t('wrong_password')
        } else if (err.name === 'APIBadRequestError') {
          // Display form error
          this.serverError = err.message
        } else {
          throw err
        }
      })
    }
  },

  mixins: [validationMixin],
  components: { PasswordForm }
}
</script>
