<template>
  <div class="login">
    <b-alert v-if="apiError" variant="danger">
      <icon iname="exclamation-triangle" /> {{ $t(apiError) }}
    </b-alert>

    <b-form @submit.prevent="login">
      <!-- FIXME add hidden domain input ? -->
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
          v-model="password" :disabled="disabled"
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
  </div>
</template>

<script>
export default {
  name: 'Login',

  data () {
    return {
      disabled: false,
      password: '',
      isValid: null,
      apiError: undefined
    }
  },

  methods: {
    login () {
      this.$store.dispatch('LOGIN', this.password).catch(() => {
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
    }).catch(err => {
      this.apiError = err.message
    })
  }
}
</script>
