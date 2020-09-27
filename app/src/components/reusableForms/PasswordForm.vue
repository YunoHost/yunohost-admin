<template>
  <b-card header-tag="h2" class="basic-form">
    <template v-slot:header>
      <h2><icon iname="key-modern" /> {{ title }}</h2>
    </template>

    <b-form id="password-form" @submit.prevent="onSubmit">
      <b-alert variant="warning" show>
        {{ $t('good_practices_about_admin_password') }}
      </b-alert>

      <slot name="message" />

      <hr>

      <slot name="input" />

      <!-- PASSWORD -->
      <input-helper
        id="password" type="password" :label="$t('password_new')"
        v-model="form.password" :placeholder="$t('tools_adminpw_new_placeholder')"
        :state="isValid.password" :error="error.password"
        @input="validateNewPassword"
      />

      <!-- PASSWORD CONFIRMATION -->
      <input-helper
        id="confirmation" type="password" :label="$t('password_confirmation')"
        v-model="form.confirmation" :placeholder="$t('tools_adminpw_confirm_placeholder')"
        :state="isValid.confirmation" :error="$t('passwords_dont_match')"
        @input="validateNewPassword"
      />
    </b-form>

    <template v-slot:footer>
      <b-button
        type="submit" form="password-form" variant="success"
        :disabled="!everythingValid"
      >
        {{ submitText ? submitText : $t('save') }}
      </b-button>
    </template>
  </b-card>
</template>

<script>
import InputHelper from '@/components/InputHelper'

export default {
  name: 'PasswordForm',

  props: {
    title: {
      type: String,
      required: true
    },
    submitText: {
      type: String,
      default: null
    },
    isValid: {
      type: Object,
      default: () => ({
        password: null,
        confirmation: null
      })
    },
    error: {
      type: Object,
      default: () => ({
        password: '',
        confirmation: ''
      })
    }
  },

  data () {
    return {
      form: {
        password: '',
        confirmation: ''
      }
    }
  },

  computed: {
    everythingValid () {
      for (const key in this.isValid) {
        if (this.form[key] === '') return false
        if (this.isValid[key] === false) return false
      }
      return true
    }
  },

  methods: {
    onSubmit () {
      if (this.everythingValid) {
        this.$emit('submit', this.form.password)
      }
    },

    isValidPassword (password) {
      return password.length >= 8 ? null : false
    },

    validateNewPassword () {
      const { password, confirmation } = this.form
      this.error.password = this.$i18n.t('passwords_too_short')
      this.isValid.password = this.isValidPassword(password)
      this.isValid.confirmation = password === confirmation ? null : false
    }
  },

  components: {
    InputHelper
  }
}
</script>
