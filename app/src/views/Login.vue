<template>
  <b-form @submit.prevent="login">
    <b-input-group>
      <template v-slot:prepend>
        <b-input-group-text>
          <label class="sr-only" for="input-password">{{ $t('password') }}</label>
          <icon iname="lock" class="sm" />
        </b-input-group-text>
      </template>

      <b-form-input
        id="input-password"
        required type="password"
        v-model="password"
        :placeholder="$t('administration_password')" :state="isValid"
      />

      <template v-slot:append>
        <b-button type="submit" variant="success" :disabled="disabled">
          {{ $t('login') }}
        </b-button>
      </template>
    </b-input-group>

    <b-form-invalid-feedback :state="isValid">
      {{ $t('wrong_password') }}
    </b-form-invalid-feedback>
  </b-form>
</template>

<script>
export default {
  name: 'Login',

  data () {
    return {
      disabled: true,
      password: '',
      isValid: null,
      apiError: undefined
    }
  },

  methods: {
    login () {
      this.$store.dispatch('LOGIN', this.password).catch(err => {
        if (err.name !== 'APIUnauthorizedError') throw err
        this.isValid = false
      })
    }
  },

  created () {
    this.$store.dispatch('CHECK_INSTALL').then(installed => {
      if (installed) {
        this.disabled = false
      } else {
        this.$router.push({ name: 'post-install' })
      }
    })
  }
}
</script>
