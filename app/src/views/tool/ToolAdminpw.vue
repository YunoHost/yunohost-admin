<template>
  <password-form
    :title="$t('postinstall_set_password')" :submit-text="$t('next')"
    :error="error" :is-valid="isValid"
    @submit="onSubmit"
  >
    <template v-slot:input>
      <!-- CURRENT ADMIN PASSWORD -->
      <input-helper
        id="current-password" type="password" :label="$t('tools_adminpw_current')"
        v-model="currentPassword" :placeholder="$t('tools_adminpw_current_placeholder')"
        :state="isValid.currentPassword" :error="error.currentPassword"
        @input="validateCurrentPassword"
      />
      <hr>
    </template>
  </password-form>
</template>

<script>
import api from '@/helpers/api'
import { PasswordForm } from '@/components/reusableForms'
import InputHelper from '@/components/InputHelper'

export default {
  name: 'ToolAdminpw',

  data () {
    return {
      currentPassword: '',
      isValid: {
        currentPassword: null,
        password: null,
        confirmation: null
      },
      error: {
        currentPassword: '',
        password: '',
        confirmation: ''
      }
    }
  },

  methods: {
    onSubmit (password) {
      if (this.isValid.currentPassword === false) return

      api.post('login', { password: this.currentPassword }).then(() => {
        api.put('adminpw', { new_password: password }).then(() => {
          this.$store.dispatch('DISCONNECT')
          this.$router.push({ name: 'login' })
        }).catch(err => {
          this.error.password = err.message
          this.isValid.password = false
        })
      }).catch(() => {
        this.error.currentPassword = this.$i18n.t('wrong_password')
        this.isValid.currentPassword = false
      })
    },

    validateCurrentPassword () {
      this.error.currentPassword = this.$i18n.t('passwords_too_short')
      this.isValid.currentPassword = this.currentPassword.length >= 8 ? null : false
    }
  },

  components: {
    InputHelper,
    PasswordForm
  }
}
</script>
