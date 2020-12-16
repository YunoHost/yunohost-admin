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

import { PasswordForm } from '@/components/reusableForms'
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
    onSubmit ({ password, currentPassword }) {
      this.serverError = ''
      // Use `api.fetch` to avoid automatic redirect on 401 (Unauthorized).
      api.fetch('POST', 'login', { password: currentPassword }).then(response => {
        if (response.status === 401) {
          // Dispatch `SERVER_RESPONDED` to hide waiting overlay and display error.
          this.$store.dispatch('SERVER_RESPONDED', true)
          this.serverError = this.$i18n.t('wrong_password')
        } else if (response.ok) {
          api.put('adminpw', { new_password: password }).then(() => {
            this.$store.dispatch('DISCONNECT')
          }).catch(error => {
            this.serverError = error.message
          })
        }
      })
    }
  },

  mixins: [validationMixin],
  components: { PasswordForm }
}
</script>
