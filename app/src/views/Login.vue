<template>
  <b-form @submit.prevent="login">
    <!-- TODO add hidden domain input -->
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
        <b-button type="submit" variant="success">
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

  data: () => {
    return {
      password: '',
      isValid: null
    }
  },

  methods: {
    async login () {
      this.$store.dispatch(
        'LOGIN', this.password
      ).then(() => {
        this.$store.dispatch('GET_YUNOHOST_INFOS')
        this.$router.push(this.$route.query.redirect || '/')
      }).catch(() => {
        this.isValid = false
      })
    }
  }
  // TODO checkInstall
  // beforeRouteEnter (to, from, next) {
  // },
}
</script>

<style lang="scss" scoped>
</style>
