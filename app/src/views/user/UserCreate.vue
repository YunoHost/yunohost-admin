<template lang="html">
  <div class="user-create">
    <breadcrumb />

    <b-card :header="$t('users_new')" header-tag="h2">
      <b-form id="user-create" @submit.prevent="onSubmit">
        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_username')" label-for="input-username" label-class="test"
        >
          <b-input
            id="input-username" :placeholder="$t('placeholder.username')"
            aria-describedby="username-feedback" required
            v-model="form.username" :state="isValid.username"
            @input="validateUsername" @blur="populateEmail"
          />
          <b-form-invalid-feedback id="username-feedback" :state="isValid.username">
            {{ this.error.username }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group label-cols-sm="5" label-cols-lg="4" label-cols-xl="3">
          <template v-slot:label aria-hidden="true">
            {{ $t('user_fullname') }}
          </template>

          <div class="input-double" id="group-fullname">
            <b-input-group>
              <b-input-group-prepend
                tag="label" class="ssr-only" is-text
                for="input-firstname"
              >
                {{ $t('common.firstname') }}
              </b-input-group-prepend>

              <b-input
                id="input-firstname" :placeholder="$t('placeholder.firstname')"
                v-model="form.firstname" required
              />
            </b-input-group>

            <b-input-group>
              <b-input-group-prepend
                tag="label" class="ssr-only" is-text
                for="input-lastname"
              >
                {{ $t('common.lastname') }}
              </b-input-group-prepend>

              <b-input
                id="input-firstname" :placeholder="$t('placeholder.lastname')"
                v-model="form.lastname" required
              />
            </b-input-group>
          </div>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_email')" label-for="input-email"
        >
          <b-input-group>
            <b-input
              id="input-email" :placeholder="$t('placeholder.username')"
              aria-describedby="email-feedback"
              v-model="form.email" required
              :state="isValid.email" @input="validateEmail"
            />

            <b-input-group-append>
              <b-input-group-text>@</b-input-group-text>
            </b-input-group-append>

            <b-input-group-append>
              <b-select v-model="form.domain" :options="domains" required />
            </b-input-group-append>
          </b-input-group>

          <b-form-invalid-feedback id="email-feedback" :state="isValid.email">
            {{ this.error.email }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_mailbox_quota')" label-for="input-mailbox-quota"
          :description="$t('mailbox_quota_description')"
        >
          <b-input-group append="M">
            <b-input
              id="input-mailbox-quota" :placeholder="$t('mailbox_quota_placeholder')"
              v-model="form.mailbox_quota" type="number" min="0"
            />
          </b-input-group>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('password')" label-for="input-password"
        >
          <b-input
            id="input-password" placeholder="••••••••"
            aria-describedby="password-feedback" required
            v-model="form.password" type="password"
            :state="isValid.password" @input="validatePassword"
          />
          <b-form-invalid-feedback id="password-feedback" :state="isValid.password">
            {{ $t('passwords_too_short') }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('password_confirmation')" label-for="input-confirmation"
          :description="$t('good_practices_about_user_password')"
        >
          <b-input
            id="input-confirmation" placeholder="••••••••"
            aria-describedby="confirmation-feedback" required
            v-model="form.confirmation" type="password"
            :state="isValid.confirmation" @input="validatePassword"
          />
          <b-form-invalid-feedback id="confirmation-feedback" :state="isValid.confirmation">
            {{ $t('passwords_dont_match') }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-invalid-feedback id="global-feedback" :state="server.isValid">
          {{ this.server.error }}
        </b-form-invalid-feedback>
      </b-form>

      <template v-slot:footer>
        <div class="d-flex d-flex justify-content-end">
          <b-button type="submit" form="user-create" variant="success">
            {{ $t('save') }}
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        domain: '',
        mailbox_quota: '',
        password: '',
        confirmation: ''
      },
      isValid: {
        username: null,
        email: null,
        password: null,
        confirmation: null
      },
      error: {
        username: '',
        email: ''
      },
      server: {
        isValid: null,
        error: ''
      }
    }
  },

  computed: {
    domains () {
      return this.$store.state.data.domains
    }
  },

  methods: {
    onSubmit () {
      for (const key in this.isValid) {
        if (this.isValid[key] === false) return
      }

      const data = JSON.parse(JSON.stringify(this.form))
      const quota = data.mailbox_quota
      data.mailbox_quota = parseInt(quota) ? quota + 'M' : 0
      data.mail = `${data.email}@${data.domain}`

      this.$store.dispatch('POST',
        { uri: 'users', data, param: data.username, storeKey: '' }
      ).catch(error => {
        this.server.error = error.message
        this.server.isValid = false
      })
    },

    populateEmail () {
      if (this.form.email === '') {
        this.form.email = this.form.username
      }
    },

    validateUsername () {
      const username = this.form.username
      let error = ''
      if (!username.match('^[a-z0-9_]+$')) {
        // FIXME check allowed characters
        error = this.$i18n.t('form_errors.username_syntax')
      } else if (Object.keys(this.$store.state.data.users).includes(username)) {
        error = this.$i18n.t('form_errors.username_exists', { user: username })
      }
      this.error.username = error
      this.isValid.username = error === '' ? null : false
    },

    validateEmail () {
      // FIXME check allowed characters
      const isValid = this.form.email.match('^[A-Za-z0-9-_]+$')
      this.error.email = isValid ? '' : this.$i18n.t('form_errors.email_syntax')
      this.isValid.email = isValid ? null : false
    },

    validatePassword () {
      const { password, confirmation } = this.form
      this.isValid.password = password.length >= 8 ? null : false
      this.isValid.confirmation = password === confirmation ? null : false
    }
  },

  created () {
    this.$store.dispatch('FETCH', { uri: 'domains' }).then(domains => {
      this.form.domain = domains[0]
    })
    this.$store.dispatch('FETCH', { uri: 'users' })
  }
}
</script>

<style lang="scss" scoped>
@include media-breakpoint-down(xs) {
   .form-group + .form-group {
     padding-top: .5rem;
     border-top: $thin-border;
   }
}

@include media-breakpoint-up(md) {
  .input-double {
    display: flex;
    .input-group + .input-group {
      margin-left: .5rem;
    }
  }
}

.input-group {
  select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
