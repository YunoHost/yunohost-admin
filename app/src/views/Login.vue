<template>
  <card-form
    :title="$t('login')" icon="lock"
    :validation="$v" :server-error="serverError"
    @submit.prevent="login"
  >
    <!-- ADMIN USERNAME -->
    <form-field v-bind="fields.username" v-model="form.username" :validation="$v.form.username" />

    <!-- ADMIN PASSWORD -->
    <form-field v-bind="fields.password" v-model="form.password" :validation="$v.form.password" />

    <template #buttons>
      <b-button
        type="submit" variant="success"
        :disabled="!installed" form="ynh-form"
      >
        {{ $t('login') }}
      </b-button>
    </template>
  </card-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { alphalownumdot_, required, minLength } from '@/helpers/validators'

export default {
  name: 'Login',

  mixins: [validationMixin],

  props: {
    forceReload: { type: Boolean, default: false }
  },

  data () {
    return {
      serverError: '',
      form: {
        username: '',
        password: ''
      },
      fields: {
        username: {
          label: this.$i18n.t('user_username'),
          props: {
            id: 'username',
            autocomplete: 'username'
          }
        },
        password: {
          label: this.$i18n.t('password'),
          props: {
            id: 'password',
            type: 'password',
            autocomplete: 'current-password'
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters(['installed'])
  },

  validations () {
    return {
      form: {
        username: { required, alphalownumdot_ },
        password: { required, passwordLenght: minLength(4) }
      }
    }
  },

  methods: {
    login () {
      const credentials = [this.form.username, this.form.password].join(':')
      this.$store.dispatch('LOGIN', credentials).then(() => {
        if (this.forceReload) {
          window.location.href = '/yunohost/admin/'
        } else {
          this.$router.push(this.$router.currentRoute.query.redirect || { name: 'home' })
        }
      }).catch(err => {
        if (err.name !== 'APIUnauthorizedError') throw err
        this.serverError = this.$i18n.t('wrong_password_or_username')
      })
    }
  }
}
</script>
