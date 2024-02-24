<template>
  <CardForm
    :title="$t('login')" icon="lock"
    :validation="$v" :server-error="serverError"
    @submit.prevent="login"
  >
    <!-- ADMIN USERNAME -->
    <FormField v-bind="fields.username" v-model="form.username" :validation="$v.form.username" />

    <!-- ADMIN PASSWORD -->
    <FormField v-bind="fields.password" v-model="form.password" :validation="$v.form.password" />

    <template #buttons>
      <BButton
        type="submit" variant="success"
        :disabled="!installed" form="ynh-form"
      >
        {{ $t('login') }}
      </BButton>
    </template>
  </CardForm>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { alphalownumdot_, required, minLength } from '@/helpers/validators'

export default {
  name: 'LoginView',

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
