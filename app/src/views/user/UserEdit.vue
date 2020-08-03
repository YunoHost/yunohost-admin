<template lang="html">
  <basic-form
    v-if="user" :header="$t('user_username_edit', { name: user.username })"
    @submit.prevent="onSubmit"
  >
    <!-- USER FULLNAME -->
    <b-form-group label-cols="auto">
      <template v-slot:label aria-hidden="true">
        {{ $t('user_fullname') }}
      </template>

      <div class="input-double">
        <b-input-group>
          <b-input-group-prepend
            tag="label" class="ssr-only" is-text
            for="input-firstname"
          >
            {{ $t('common.firstname') }}
          </b-input-group-prepend>

          <b-input
            id="input-firstname" :placeholder="$t('placeholder.firstname')"
            v-model="form.firstname"
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
            v-model="form.lastname"
          />
        </b-input-group>
      </div>
    </b-form-group>

    <!-- USER EMAIL -->
    <b-form-group label-cols="auto" :label="$t('user_email')" label-for="input-email">
      <adress-input-select
        id="input-email" feedback-id="email-feedback"
        v-model="form.mail" :options="domains"
        :state="isValid.mail" @input="validateEmail"
        :placeholder="$t('placeholder.username')"
      />

      <b-form-invalid-feedback id="email-feedback" :state="isValid.mail">
        {{ this.error.mail }}
      </b-form-invalid-feedback>
    </b-form-group>

    <!-- MAILBOX QUOTA -->
    <hr>
    <b-form-group
      label-cols="auto" :label="$t('user_mailbox_quota')" label-for="input-mailbox-quota"
      :description="$t('mailbox_quota_description')"
    >
      <b-input-group append="M">
        <b-input
          id="input-mailbox-quota" :placeholder="$t('mailbox_quota_placeholder')"
          v-model="form['mailbox-quota']" type="number" min="0"
        />
      </b-input-group>
    </b-form-group>

    <!-- MAIL ALIASES -->
    <hr>
    <b-form-group label-cols="auto" :label="$t('user_emailaliases')" class="mail-list">
      <adress-input-select
        v-for="(alias, index) in form['mail-aliases']" :key="index"
        v-model="form['mail-aliases'][index]" :options="domains"
        :placeholder="$t('placeholder.username')"
      />
    </b-form-group>

    <!-- MAIL FORWARD -->
    <hr>
    <b-form-group label-cols="auto" :label="$t('user_emailforward')" class="mail-list">
      <b-input
        v-for="(forward, index) in form['mail-forward']" :key="index"
        id="input-mailbox-quota" :placeholder="$t('user_new_forward')"
        v-model="form['mail-forward'][index]" type="email"
      />
    </b-form-group>

    <!-- USER PASSWORD -->
    <hr>
    <b-form-group label-cols="auto" :label="$t('password')" label-for="input-password">
      <b-input
        id="input-password" placeholder="••••••••"
        aria-describedby="password-feedback"
        v-model="form.password" type="password"
        :state="isValid.password" @input="validatePassword"
      />
      <b-form-invalid-feedback id="password-feedback" :state="isValid.password">
        {{ $t('passwords_too_short') }}
      </b-form-invalid-feedback>
    </b-form-group>

    <!-- USER PASSWORD CONFIRMATION -->
    <b-form-group
      label-cols="auto" :label="$t('password_confirmation')" label-for="input-confirmation"
      :description="$t('good_practices_about_user_password')"
    >
      <b-input
        id="input-confirmation" placeholder="••••••••"
        aria-describedby="confirmation-feedback"
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
  </basic-form>
</template>

<script>
import BasicForm from '@/components/BasicForm'
import AdressInputSelect from '@/components/AdressInputSelect'

export default {
  name: 'UserEdit',
  props: {
    name: { type: String, required: true }
  },
  data () {
    return {
      form: {
        firstname: '',
        lastname: '',
        mail: '',
        'mailbox-quota': '',
        'mail-aliases': [],
        'mail-forward': [],
        password: '',
        confirmation: ''
      },
      isValid: {
        mail: null,
        password: null,
        confirmation: null
      },
      error: {
        mail: ''
      },
      server: {
        isValid: null,
        error: ''
      }
    }
  },

  computed: {
    user () {
      return this.$store.state.data.users_details[this.name]
    },
    domains () {
      return this.$store.state.data.domains
    }
  },

  methods: {
    onSubmit () {
      console.log(this.form['mail-aliases'])
      for (const key in this.isValid) {
        if (this.isValid[key] === false) return
      }

      const data = {}

      for (const key of ['firstname', 'lastname', 'mail']) {
        if (this.form[key] !== this.user[key]) data[key] = this.form[key]
      }

      let quota = this.form['mailbox-quota']
      quota = parseInt(quota) ? quota + 'M' : 'No quota'
      if (quota !== this.user['mailbox-quota'].limit) {
        data.mailbox_quota = quota !== 'No quota' ? quota : 0
      }

      const mails = {
        add_mailalias: arrayDiff(this.form['mail-aliases'], this.user['mail-aliases']),
        remove_mailalias: arrayDiff(this.user['mail-aliases'], this.form['mail-aliases']),
        add_mailforward: arrayDiff(this.form['mail-forward'], this.user['mail-forward']),
        remove_mailforward: arrayDiff(this.user['mail-forward'], this.form['mail-forward'])
      }
      for (const [key, value] of Object.entries(mails)) {
        if (value.length > 0) data[key] = value
      }

      // FIXME move to utils
      function arrayDiff (arr1 = [], arr2 = []) {
        return arr1.filter(item => ((arr2.indexOf(item) === -1) && (item !== '')))
      }

      this.$store.dispatch('PUT',
        { uri: 'users', data, param: this.user.username, storeKey: 'users_details' }
      ).then(() => {
        this.$router.push({ name: 'user-list' })
      }).catch(error => {
        this.server.error = error.message
        this.server.isValid = false
      })
    },

    validateEmail (mail) {
      // FIXME check allowed characters
      console.log('validate', mail)
      const isValid = mail.split('@')[0].match('^[A-Za-z0-9-_]+$')
      this.error.mail = isValid ? '' : this.$i18n.t('form_errors.email_syntax')
      this.isValid.mail = isValid ? null : false
    },

    validatePassword () {
      const { password, confirmation } = this.form
      this.isValid.password = password.length >= 8 ? null : false
      this.isValid.confirmation = password === confirmation ? null : false
    }
  },

  created () {
    this.$store.dispatch('FETCH_ALL', [
      { uri: 'domains' },
      { uri: 'users', param: this.name, storeKey: 'users_details' }
    ]).then(([domainsData, userData]) => {
      this.form.firstname = userData.firstname
      this.form.lastname = userData.lastname
      this.form.mail = userData.mail
      console.log('fetch', this.form.mail)
      this.form['mail-aliases'] = userData['mail-aliases'] ? [...userData['mail-aliases'], ''] : ['']
      this.form['mail-forward'] = userData['mail-forward'] ? [...userData['mail-forward'], ''] : ['']
      if (userData['mailbox-quota'].limit !== 'No quota') {
        this.form['mailbox-quota'] = userData['mailbox-quota'].limit.slice(0, -1)
      }
    })
  },
  components: {
    AdressInputSelect,
    BasicForm
  }
}
</script>

<style lang="scss" scoped>
@include media-breakpoint-down(xs) {
   .form-group:not(:first-of-type) {
     padding-top: .5rem;
     border-top: $thin-border;
   }
   hr {
     display: none;
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

.mail-list .col > *:not(:first-of-type) {
  margin-top: .5rem;

  input {
    max-width: 10rem;
  }
}
</style>
