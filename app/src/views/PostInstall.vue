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

      <b-button size="lg" variant="primary" @click="step = 'domain'">
        {{ $t('begin') }}
      </b-button>
    </template>

    <!-- DOMAIN SETUP STEP -->
    <template v-else-if="step === 'domain'">
      <domain-form @submit="setDomain" :title="$t('postinstall_set_domain')" :submit-text="$t('next')">
        <template #disclaimer>
          <p class="alert alert-warning" v-t="'postinstall_domain'" />
        </template>
      </domain-form>

      <b-button variant="primary" @click="step = 'start'" class="mt-3">
        <icon iname="chevron-left" /> {{ $t('previous') }}
      </b-button>
    </template>

    <!-- PASSWORD SETUP STEP -->
    <template v-else-if="step === 'password'">
      <password-form :title="$t('postinstall_set_password')" :submit-text="$t('next')" @submit="setPassword">
        <template #disclaimer>
          <p class="alert alert-warning" v-t="'postinstall_password'" />
        </template>
      </password-form>

      <b-button variant="primary" @click="step = 'domain'" class="mt-3">
        <icon iname="chevron-left" /> {{ $t('previous') }}
      </b-button>
    </template>

    <!-- POST-INSTALL SUCCESS STEP -->
    <template v-else-if="step === 'login'">
      <p class="alert alert-success">
        <icon iname="thumbs-up" /> {{ $t('installation_complete') }}
      </p>
      <login-view />
    </template>

    <!-- CONFIRM POST-INSTALL MODAL -->
    <b-modal
      ref="post-install-modal" id="post-install-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="performPostInstall" hide-header
    >
      {{ $t('confirm_postinstall', { domain }) }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import { DomainForm, PasswordForm } from '@/components/reusableForms'
import LoginView from '@/views/Login'

export default {
  name: 'PostInstall',

  data () {
    return {
      step: 'start',
      domain: undefined,
      password: undefined
    }
  },

  methods: {
    setDomain ({ domain }) {
      this.domain = domain
      this.step = 'password'
    },

    setPassword ({ password }) {
      this.password = password
      this.$refs['post-install-modal'].show()
    },

    performPostInstall () {
      // FIXME does the api will throw an error for bad passwords ?
      api.post('postinstall', { domain: this.domain, password: this.password }).then(data => {
        // Display success message and allow the user to login
        this.step = 'login'
      })
    }
  },

  created () {
    this.$store.dispatch('CHECK_INSTALL').then(installed => {
      if (installed) {
        this.$router.push({ name: 'home' })
      }
    })
  },

  components: {
    DomainForm,
    PasswordForm,
    LoginView
  }
}
</script>
