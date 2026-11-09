<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, type LocationQueryValue } from 'vue-router'

import { APIUnauthorizedError } from '@/api/errors'
import TwoFactorSetup from '@/components/TwoFactorSetup.vue'
import { useForm } from '@/composables/form'
import { useInfos } from '@/composables/useInfos'
import type { TwoFactorSetup as TwoFactorSetupData } from '@/helpers/twofactor'
import { parseTwoFactorChallenge } from '@/helpers/twofactor'
import { alphalownumdot_, minLength, required } from '@/helpers/validators'
import type { FieldProps, FormFieldDict } from '@/types/form'

const props = withDefaults(
  defineProps<{
    forceReload?: boolean
  }>(),
  {
    forceReload: false,
  },
)

const { t } = useI18n()
const router = useRouter()
const { login, installed, currentUser } = useInfos()

type Form = typeof form.value
const form = ref({
  username: '',
  password: '',
})
const fields = {
  username: {
    component: 'InputItem',
    label: t('user_username'),
    rules: { required, alphalownumdot_ },
    cProps: {
      id: 'username',
      autocomplete: 'username',
      autocapitalize: 'off',
      spellcheck: 'false',
      autofocus: '',
    },
  } satisfies FieldProps<'InputItem', Form['username']>,

  password: {
    component: 'InputItem',
    label: t('password'),
    rules: { required, passwordLenght: minLength(4) },
    cProps: {
      id: 'password',
      type: 'password',
      autocomplete: 'current-password',
    },
  } satisfies FieldProps<'InputItem', Form['password']>,
} satisfies FormFieldDict<Form>

const { v, onSubmit, serverErrors } = useForm(form, fields)

// 'password': regular login
// 'code': password OK, the admin has 2FA enabled and must give a code
// 'setup': password OK, 2FA is mandatory and must be set up now
type Step = 'password' | 'code' | 'setup'
const step = ref<Step>('password')
const setup = ref<TwoFactorSetupData | null>(null)
const code = ref('')
const savedCodes = ref(false)
const useRecoveryCode = ref(false)
const codeError = ref<string | null>(null)
const stepMessage = ref<string | null>(null)
const loading = ref(false)

function goToStep(next: Step) {
  step.value = next
  code.value = ''
  savedCodes.value = false
  useRecoveryCode.value = false
  codeError.value = null
  focusCode()
}

function backToPassword() {
  setup.value = null
  goToStep('password')
}

function focusCode() {
  if (step.value === 'password') return
  nextTick(() => document.getElementById('twofactor-code')?.focus())
}
watch(useRecoveryCode, focusCode)

function onLoggedIn() {
  currentUser.value = form.value.username
  if (props.forceReload) {
    window.location.href = '/yunohost/admin/'
  } else {
    router.push(
      (router.currentRoute.value.query.redirect as LocationQueryValue) || {
        name: 'home',
      },
    )
  }
}

async function attemptLogin() {
  serverErrors.global = []
  const { username, password } = form.value
  const extra: Record<string, string> = {}
  if (step.value !== 'password' && code.value.trim()) {
    extra.twofactor_code = code.value.trim()
  }
  if (step.value === 'setup' && setup.value) {
    extra.twofactor_setup_token = setup.value.setup_token
  }

  loading.value = true
  try {
    await login([username, password].join(':'), extra)
    onLoggedIn()
  } catch (err) {
    if (!(err instanceof APIUnauthorizedError)) throw err

    const challenge = parseTwoFactorChallenge(err.data)
    if (!challenge) {
      // Wrong username/password
      backToPassword()
      serverErrors.global = [t('wrong_password_or_username')]
      return
    }

    switch (challenge.error) {
      case 'twofactor_code_required':
        goToStep('code')
        break
      case 'twofactor_setup_required':
        setup.value = challenge as TwoFactorSetupData
        goToStep('setup')
        break
      case 'twofactor_code_invalid':
        code.value = ''
        codeError.value = t('twofactor.code_invalid')
        focusCode()
        break
      case 'twofactor_setup_token_expired':
      case 'twofactor_setup_token_invalid':
        backToPassword()
        stepMessage.value = t('twofactor.setup_expired')
        break
    }
  } finally {
    loading.value = false
  }
}

const onLogin = onSubmit((onError) => {
  stepMessage.value = null
  attemptLogin().catch(onError)
})

function onSubmitCode() {
  codeError.value = null
  if (!code.value.trim()) {
    codeError.value = t('twofactor.code_required')
    return
  }
  if (step.value === 'setup' && !savedCodes.value) {
    codeError.value = t('twofactor.must_save_recovery_codes')
    return
  }
  attemptLogin().catch((err) => {
    codeError.value = err.message
  })
}
</script>

<template>
  <div>
    <YAlert v-if="stepMessage" variant="warning" class="mb-3">
      {{ stepMessage }}
    </YAlert>

    <!-- Kept mounted (username/password are reused for the 2FA steps) -->
    <div v-show="step === 'password'">
      <CardForm
        id="login-form"
        v-model="form"
        :fields="fields"
        icon="lock"
        :title="t('login')"
        :validations="v"
        @submit="onLogin"
      >
        <template #buttons>
          <!-- FIXME should we remove the disabled state? -->
          <BButton
            type="submit"
            variant="success"
            :disabled="!installed || loading"
            form="login-form"
          >
            {{ t('login') }}
          </BButton>
        </template>
      </CardForm>
    </div>

    <YCard
      v-if="step !== 'password'"
      id="twofactor-form"
      icon="lock"
      :title="t('twofactor.title')"
    >
      <BForm novalidate @submit.prevent="onSubmitCode">
        <template v-if="step === 'setup' && setup">
          <YAlert variant="info">
            {{ t('twofactor.login_setup_required') }}
          </YAlert>
          <TwoFactorSetup :setup="setup" />
        </template>
        <p v-else aria-live="polite">
          {{
            useRecoveryCode
              ? t('twofactor.login_enter_recovery_code', {
                  username: form.username,
                })
              : t('twofactor.login_enter_code', { username: form.username })
          }}
        </p>

        <BFormGroup
          :label="
            useRecoveryCode ? t('twofactor.recovery_code') : t('twofactor.code')
          "
          label-for="twofactor-code"
          :state="codeError ? false : null"
          :invalid-feedback="codeError ?? ''"
        >
          <BFormInput
            id="twofactor-code"
            v-model="code"
            class="font-monospace"
            :placeholder="useRecoveryCode ? 'xxxx-xxxx-xxxx' : '123456'"
            :inputmode="useRecoveryCode ? 'text' : 'numeric'"
            :autocomplete="useRecoveryCode ? 'off' : 'one-time-code'"
            autocapitalize="off"
            spellcheck="false"
            :state="codeError ? false : null"
          />
        </BFormGroup>

        <BFormCheckbox
          v-if="step === 'setup'"
          id="twofactor-saved-codes"
          v-model="savedCodes"
          class="mb-3"
        >
          {{ t('twofactor.i_saved_recovery_codes') }}
        </BFormCheckbox>

        <div class="d-flex flex-wrap gap-2 align-items-center">
          <BButton type="submit" variant="success" :disabled="loading">
            {{
              step === 'setup' ? t('twofactor.enable_and_login') : t('login')
            }}
          </BButton>
          <BButton variant="link" @click="backToPassword">
            {{ t('cancel') }}
          </BButton>
          <BButton
            v-if="step === 'code'"
            variant="link"
            class="ms-auto"
            @click="useRecoveryCode = !useRecoveryCode"
          >
            {{
              useRecoveryCode
                ? t('twofactor.use_authenticator_code')
                : t('twofactor.use_recovery_code')
            }}
          </BButton>
        </div>
      </BForm>
    </YCard>
  </div>
</template>
