<template>
  <div class="post-install">
    <!-- START STEP -->
    <template v-if="step === 'start'">
      <p class="alert alert-success">
        <icon iname="thumbs-up" /> {{ $t('postinstall_intro_1') }}
      </p>

      <p class="alert alert-info">
        <span v-t="'postinstall_intro_2'" />
        <br>
        <span v-html="$t('postinstall_intro_3')" />
      </p>

      <b-button size="lg" variant="success" @click="goToStep('domain')">
        {{ $t('begin') }}
      </b-button>
    </template>

    <!-- DOMAIN SETUP STEP -->
    <template v-else-if="step === 'domain'">
      <domain-form
        :title="$t('postinstall_set_domain')" :submit-text="$t('next')" :server-error="serverError"
        @submit="setDomain"
      >
        <template #disclaimer>
          <p class="alert alert-info" v-t="'postinstall_domain'" />
        </template>
      </domain-form>

      <b-button variant="primary" @click="goToStep('start')" class="mt-3">
        <icon iname="chevron-left" /> {{ $t('previous') }}
      </b-button>
    </template>

    <!-- FIRST USER SETUP STEP -->
    <template v-else-if="step === 'user'">
      <card-form
        :title="$t('postinstall.user.title')" icon="user-plus"
        :validation="$v" :server-error="serverError"
        :submit-text="$t('next')" @submit.prevent="setUser"
      >
        <read-only-alert-item
          :label="$t('postinstall.user.first_user_help')"
          type="info"
        />

        <form-field
          v-for="(field, name) in fields" :key="name"
          v-bind="field" v-model="user[name]" :validation="$v.user[name]"
        />
      </card-form>

      <b-button variant="primary" @click="goToStep('domain')" class="mt-3">
        <icon iname="chevron-left" /> {{ $t('previous') }}
      </b-button>
    </template>

    <template v-else-if="step === 'rootfsspace-error'">
      <card no-body header-class="d-none" footer-bg-variant="danger">
        <b-card-body class="alert alert-danger m-0">
          {{ serverError }}
        </b-card-body>

        <template #buttons>
          <b-button variant="light" size="sm" @click="performPostInstall(true)">
            <icon iname="warning" /> {{ $t('postinstall.force') }}
          </b-button>
        </template>
      </card>
    </template>

    <!-- POST-INSTALL SUCCESS STEP -->
    <template v-else-if="step === 'login'">
      <p class="alert alert-success">
        <icon iname="thumbs-up" /> {{ $t('installation_complete') }}
      </p>
      <login skip-install-check />
    </template>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'

import api from '@/api'
import { DomainForm } from '@/views/_partials'
import Login from '@/views/Login.vue'
import { alphalownum_, required, minLength, name, sameAs } from '@/helpers/validators'

export default {
  name: 'PostInstall',

  mixins: [validationMixin],

  components: {
    DomainForm,
    Login
  },

  data () {
    return {
      step: 'start',
      serverError: '',
      domain: undefined,
      user: {
        username: '',
        fullname: '',
        password: '',
        confirmation: ''
      },

      fields: {
        username: {
          label: this.$i18n.t('user_username'),
          props: { id: 'username', placeholder: this.$i18n.t('placeholder.username') }
        },

        fullname: {
          label: this.$i18n.t('user_fullname'),
          props: { id: 'fullname', placeholder: this.$i18n.t('placeholder.fullname') }
        },

        password: {
          label: this.$i18n.t('password'),
          description: this.$i18n.t('good_practices_about_admin_password'),
          descriptionVariant: 'warning',
          props: { id: 'password', placeholder: '••••••••', type: 'password' }
        },

        confirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: { id: 'confirmation', placeholder: '••••••••', type: 'password' }
        }
      }
    }
  },

  methods: {
    goToStep (step) {
      this.serverError = ''
      this.step = step
    },

    setDomain ({ domain }) {
      this.domain = domain
      this.goToStep('user')
    },

    async setUser () {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_postinstall', { domain: this.domain })
      )
      if (!confirmed) return
      this.performPostInstall()
    },

    performPostInstall (force = false) {
      const data = {
        domain: this.domain,
        username: this.user.username,
        fullname: this.user.fullname,
        password: this.user.password
      }
      // FIXME does the api will throw an error for bad passwords ?
      api.post(
        'postinstall' + (force ? '?force_diskspace' : ''),
        data,
        { key: 'postinstall' }
      ).then(() => {
        // Display success message and allow the user to login
        this.goToStep('login')
      }).catch(err => {
        const hasWordsInError = (words) => words.some((word) => (err.key || err.message).includes(word))
        if (err.name !== 'APIBadRequestError') throw err
        if (err.key === 'postinstall_low_rootfsspace') {
          this.step = 'rootfsspace-error'
        } else if (hasWordsInError(['domain', 'dyndns'])) {
          this.step = 'domain'
        } else if (hasWordsInError(['password', 'user'])) {
          this.step = 'user'
        } else {
          throw err
        }
        this.serverError = err.message
      })
    }
  },

  validations () {
    return {
      user: {
        username: { required, alphalownum_ },
        fullname: { required, name },
        password: { required, passwordLenght: minLength(8) },
        confirmation: { required, passwordMatch: sameAs('password') }
      }
    }
  },

  created () {
    this.$store.dispatch('CHECK_INSTALL').then(installed => {
      if (installed) {
        this.$router.push({ name: 'home' })
      }
    })
  }
}
</script>
