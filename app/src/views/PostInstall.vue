<script setup lang="ts">
import router from '@/router'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { APIBadRequestError } from '@/api/errors'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInfos } from '@/composables/useInfos'
import {
  alphalownumdot_,
  minLength,
  name,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatForm } from '@/helpers/yunohostArguments'
import type { FieldProps, FormFieldDict } from '@/types/form'
import LoginView from '@/views/LoginView.vue'
import { DomainForm } from '@/views/_partials'

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { installed } = useInfos()

if (installed.value) {
  router.push({ name: 'home' })
}

type Steps = 'start' | 'domain' | 'user' | 'rootfsspace-error' | 'login'
const step = ref<Steps>('start')
const serverError = ref('')
const domain = ref('')
const dyndns_recovery_password = ref<string | undefined>()

type Form = typeof form.value
const form = ref({
  username: '',
  fullname: '',
  password: '',
  confirmation: '',
})
const fields = {
  alert: {
    component: 'ReadOnlyAlertItem',
    cProps: { label: t('postinstall.user.first_user_help'), type: 'info' },
  } satisfies FieldProps<'ReadOnlyAlertItem'>,

  username: {
    component: 'InputItem',
    label: t('user_username'),
    rules: { required, alphalownumdot_ },
    cProps: { id: 'username', placeholder: t('placeholder.username') },
  } satisfies FieldProps<'InputItem', Form['username']>,

  fullname: {
    component: 'InputItem',
    label: t('user_fullname'),
    rules: { required, name },
    cProps: { id: 'fullname', placeholder: t('placeholder.fullname') },
  } satisfies FieldProps<'InputItem', Form['fullname']>,

  password: {
    component: 'InputItem',
    label: t('password'),
    description: t('good_practices_about_admin_password'),
    descriptionVariant: 'warning',
    rules: { required, passwordLenght: minLength(8) },
    cProps: { id: 'password', placeholder: '••••••••', type: 'password' },
  } satisfies FieldProps<'InputItem', Form['password']>,

  confirmation: reactive({
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: computed(() => ({
      required,
      passwordMatch: sameAs(form.value.password),
    })),
    cProps: { id: 'confirmation', placeholder: '••••••••', type: 'password' },
  }) satisfies FieldProps<'InputItem', Form['confirmation']>,
} satisfies FormFieldDict<Form>

const { v, onSubmit, serverErrors } = useForm(form, fields)

function goToStep(step_: Steps) {
  serverError.value = ''
  step.value = step_
}

function setDomain(data: {
  domain: string
  dyndns_recovery_password?: string
}) {
  domain.value = data.domain
  dyndns_recovery_password.value = data.dyndns_recovery_password
  goToStep('user')
}

const setUser = onSubmit(async () => {
  const confirmed = await modalConfirm(
    t('confirm_postinstall', { domain: domain.value }),
  )
  if (!confirmed) return
  performPostInstall()
})

async function performPostInstall(force = false) {
  const { username, fullname, password } = form.value
  const data = await formatForm(
    {
      domain: domain.value,
      dyndns_recovery_password: dyndns_recovery_password.value,
      username,
      fullname,
      password,
    },
    { removeEmpty: true },
  )

  api
    .post({
      uri: 'postinstall' + (force ? '?force_diskspace' : ''),
      data,
      humanKey: { key: 'postinstall' },
    })
    .then(() => {
      // Display success message and allow the user to login
      goToStep('login')
    })
    .catch((err) => {
      const hasWordsInError = (words: string[]) =>
        words.some((word) => (err.key || err.message).includes(word))
      if (!(err instanceof APIBadRequestError)) throw err
      if (err.key === 'postinstall_low_rootfsspace') {
        step.value = 'rootfsspace-error'
        serverError.value = err.message
      } else if (hasWordsInError(['domain', 'dyndns'])) {
        step.value = 'domain'
        serverError.value = err.message
      } else {
        step.value = 'user'
        serverErrors.global = [err.message]
      }
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
        postinstall
        :submit-text="$t('next')"
        :server-error="serverError"
        :title="$t('postinstall_set_domain')"
        @submit="setDomain"
      >
        <template #disclaimer>
          <p v-t="'postinstall_domain'" class="alert alert-info" />
        </template>
      </DomainForm>

      <BButton variant="primary" class="mt-3" @click="goToStep('start')">
        <YIcon iname="chevron-left" /> {{ $t('previous') }}
      </BButton>
    </template>

    <!-- FIRST USER SETUP STEP -->
    <template v-else-if="step === 'user'">
      <CardForm
        v-model="form"
        :fields="fields"
        icon="user-plus"
        :submit-text="$t('next')"
        :title="$t('postinstall.user.title')"
        :validations="v"
        @submit.prevent="setUser"
      />

      <BButton variant="primary" class="mt-3" @click="goToStep('domain')">
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
