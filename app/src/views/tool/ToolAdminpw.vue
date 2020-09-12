<template>
  <basic-form :header="$t('tools_adminpw')" @submit.prevent="onSubmit">
    <b-alert variant="warning" show>
      {{ $t('good_practices_about_admin_password') }}
    </b-alert>

    <!-- CURRENT ADMIN PASSWORD -->
    <input-helper
      id="current-password" type="password" :label="$t('tools_adminpw_current')"
      v-model="form.currentPassword" :placeholder="$t('tools_adminpw_current_placeholder')"
      :state="isValid.currentPassword" :error="error.currentPassword"
      @input="validateCurrentPassword"
    />

    <hr>
    <!-- NEW ADMIN PASSWORD -->
    <input-helper
      id="password" type="password" :label="$t('password_new')"
      v-model="form.password" :placeholder="$t('tools_adminpw_new_placeholder')"
      :state="isValid.password" :error="error.password"
      @input="validateNewPassword"
    />

    <!-- NEW ADMIN PASSWORD CONFIRMATION -->
    <input-helper
      id="confirmation" type="password" :label="$t('password_confirmation')"
      v-model="form.confirmation" :placeholder="$t('tools_adminpw_confirm_placeholder')"
      :state="isValid.confirmation" :error="$t('passwords_dont_match')"
      @input="validateNewPassword"
    />
  </basic-form>
</template>

<script>
import api from '@/helpers/api'
import BasicForm from '@/components/BasicForm'
import InputHelper from '@/components/InputHelper'

export default {
  name: 'ToolAdminpw',

  data () {
    return {
      form: {
        currentPassword: '',
        password: '',
        confirmation: ''
      },
      isValid: {
        currentPassword: null,
        password: null,
        confirmation: null
      },
      error: {
        currentPassword: this.$i18n.t('passwords_too_short'),
        password: this.$i18n.t('passwords_too_short')
      }
    }
  },

  methods: {
    onSubmit () {
      for (const key in this.isValid) {
        if (this.isValid[key] === false) return
      }
      const { currentPassword, password } = this.form
      api.post('login', { password: currentPassword }).then(() => {
        api.put('adminpw', { new_password: password }).then(() => {
          this.$store.dispatch('LOGOUT').then(() => {
            this.$router.push({ name: 'login' })
          })
        }).catch(err => {
          this.error.password = err.message
          this.isValid.password = false
        })
      }).catch(() => {
        this.error.currentPassword = this.$i18n.t('wrong_password')
        this.isValid.currentPassword = false
      })
    },

    isValidPassword (password) {
      return password.length >= 8 ? null : false
    },

    validateCurrentPassword () {
      this.error.currentPassword = this.$i18n.t('passwords_too_short')
      this.isValid.currentPassword = this.isValidPassword(this.form.currentPassword)
    },

    validateNewPassword () {
      const { password, confirmation } = this.form
      this.error.password = this.$i18n.t('passwords_too_short')
      this.isValid.password = this.isValidPassword(password)
      this.isValid.confirmation = password === confirmation ? null : false
    }
  },

  components: {
    InputHelper,
    BasicForm
  }
}
</script>
