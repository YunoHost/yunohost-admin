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

      <b-button size="lg" variant="primary" @click="goToStep('domain')">
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

    <!-- PASSWORD SETUP STEP -->
    <template v-else-if="step === 'password'">
      <password-form
        :title="$t('postinstall_set_password')" :submit-text="$t('next')" :server-error="serverError"
        @submit="setPassword"
      >
        <template #disclaimer>
          <p class="alert alert-warning" v-t="'postinstall_password'" />
        </template>
      </password-form>

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
import api from '@/api'
import { DomainForm, PasswordForm } from '@/views/_partials'
import Login from '@/views/Login'

export default {
  name: 'PostInstall',

  components: {
    DomainForm,
    PasswordForm,
    Login
  },

  data () {
    return {
      step: 'start',
      domain: undefined,
      password: undefined,
      serverError: ''
    }
  },

  methods: {
    goToStep (step) {
      this.serverError = ''
      this.step = step
    },

    setDomain ({ domain }) {
      this.domain = domain
      this.goToStep('password')
    },

    async setPassword ({ password }) {
      this.password = password
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_postinstall', { domain: this.domain })
      )
      if (!confirmed) return
      this.performPostInstall()
    },

    performPostInstall (force = false) {
      // FIXME does the api will throw an error for bad passwords ?
      api.post('postinstall' + (force ? '?force_diskspace' : ''), { domain: this.domain, password: this.password }).then(data => {
        // Display success message and allow the user to login
        this.goToStep('login')
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        if (err.key === 'postinstall_low_rootfsspace') {
          this.step = 'rootfsspace-error'
        } else if (err.key.includes('password')) {
          this.step = 'password'
        } else if (['domain', 'dyndns'].some(word => err.key.includes(word))) {
          this.step = 'domain'
        } else {
          throw err
        }
        this.serverError = err.message
      })
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
