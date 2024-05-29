<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import {
  alphalownumdot_,
  minLength,
  name,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatFormData } from '@/helpers/yunohostArguments'
import LoginView from '@/views/LoginView.vue'
import { DomainForm } from '@/views/_partials'

const { t } = useI18n()
const modalConfirm = useAutoModal()

const step = ref('start')
const serverError = ref('')
const domain = ref(undefined)
const dyndns_recovery_password = ref('')

const form = reactive({
  username: '',
  fullname: '',
  password: '',
  confirmation: '',
})
const rules = computed(() => ({
  username: { required, alphalownumdot_ },
  fullname: { required, name },
  password: { required, passwordLenght: minLength(8) },
  confirmation: { required, passwordMatch: sameAs(form.password) },
}))
const v$ = useVuelidate(rules, form)

const fields = {
  username: {
    label: t('user_username'),
    props: {
      id: 'username',
      placeholder: t('placeholder.username'),
    },
  },

  fullname: {
    label: t('user_fullname'),
    props: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  },

  password: {
    label: t('password'),
    description: t('good_practices_about_admin_password'),
    descriptionVariant: 'warning',
    props: { id: 'password', placeholder: '••••••••', type: 'password' },
  },

  confirmation: {
    label: t('password_confirmation'),
    props: {
      id: 'confirmation',
      placeholder: '••••••••',
      type: 'password',
    },
  },
}

function goToStep(step_) {
  serverError.value = ''
  step.value = step_
}

function setDomain(data) {
  domain.value = data.domain
  dyndns_recovery_password.value = data.dyndns_recovery_password
  goToStep('user')
}

async function setUser() {
  const confirmed = await modalConfirm(
    t('confirm_postinstall', { domain: domain.value }),
  )
  if (!confirmed) return
  performPostInstall()
}

async function performPostInstall(force = false) {
  // FIXME update formatFormData to unwrap ref auto
  const data = await formatFormData({
    domain: domain.value,
    dyndns_recovery_password: dyndns_recovery_password.value,
    username: form.username,
    fullname: form.fullname,
    password: form.password,
  })

  // FIXME does the api will throw an error for bad passwords ?
  api
    .post('postinstall' + (force ? '?force_diskspace' : ''), data, {
      key: 'postinstall',
    })
    .then(() => {
      // Display success message and allow the user to login
      goToStep('login')
    })
    .catch((err) => {
      const hasWordsInError = (words) =>
        words.some((word) => (err.key || err.message).includes(word))
      if (err.name !== 'APIBadRequestError') throw err
      if (err.key === 'postinstall_low_rootfsspace') {
        step.value = 'rootfsspace-error'
      } else if (hasWordsInError(['domain', 'dyndns'])) {
        step.value = 'domain'
      } else if (hasWordsInError(['password', 'user'])) {
        step.value = 'user'
      } else {
        throw err
      }
      serverError.value = err.message
    })
}
</script>

<template>
  <div class="post-install">
    <!-- START STEP -->
    <template v-if="step === 'start'">
      <p class="alert alert-success">
        <YIcon iname="thumbs-up" /> {{ $t('postinstall_intro_1') }}
      </p>

      <p class="alert alert-info">
        <span v-t="'postinstall_intro_2'" />
        <br />
        <span v-html="$t('postinstall_intro_3')" />
      </p>

      <BButton size="lg" variant="success" @click="goToStep('domain')">
        {{ $t('begin') }}
      </BButton>
    </template>

    <!-- DOMAIN SETUP STEP -->
    <template v-else-if="step === 'domain'">
      <DomainForm
        :title="$t('postinstall_set_domain')"
        :submit-text="$t('next')"
        :server-error="serverError"
        @submit="setDomain"
      >
        <template #disclaimer>
          <p class="alert alert-info" v-t="'postinstall_domain'" />
        </template>
      </DomainForm>

      <BButton variant="primary" @click="goToStep('start')" class="mt-3">
        <YIcon iname="chevron-left" /> {{ $t('previous') }}
      </BButton>
    </template>

    <!-- FIRST USER SETUP STEP -->
    <template v-else-if="step === 'user'">
      <CardForm
        :title="$t('postinstall.user.title')"
        icon="user-plus"
        :validation="v$"
        :server-error="serverError"
        :submit-text="$t('next')"
        @submit.prevent="setUser"
      >
        <ReadOnlyAlertItem
          :label="$t('postinstall.user.first_user_help')"
          type="info"
        />

        <FormField
          v-for="(field, key) in fields"
          :key="key"
          v-bind="field"
          v-model="form[key]"
          :validation="v$.form[key]"
        />
      </CardForm>

      <BButton variant="primary" @click="goToStep('domain')" class="mt-3">
        <YIcon iname="chevron-left" /> {{ $t('previous') }}
      </BButton>
    </template>

    <template v-else-if="step === 'rootfsspace-error'">
      <YCard no-body header-class="d-none" footer-bg-variant="danger">
        <BCardBody class="alert alert-danger m-0">
          {{ serverError }}
        </BCardBody>

        <template #buttons>
          <BButton variant="light" size="sm" @click="performPostInstall(true)">
            <YIcon iname="warning" /> {{ $t('postinstall.force') }}
          </BButton>
        </template>
      </YCard>
    </template>

    <!-- POST-INSTALL SUCCESS STEP -->
    <template v-else-if="step === 'login'">
      <p class="alert alert-success">
        <YIcon iname="thumbs-up" /> {{ $t('installation_complete') }}
      </p>
      <LoginView />
    </template>
  </div>
</template>
