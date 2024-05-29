<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import AdressInputSelect from '@/components/AdressInputSelect.vue'
import type ViewBase from '@/components/globals/ViewBase.vue'
import { arrayDiff } from '@/helpers/commons'
import {
  emailForward,
  emailLocalPart,
  helpers,
  integer,
  minLength,
  minValue,
  name as nameValidator,
  required,
  sameAs,
} from '@/helpers/validators'
import {
  adressToFormValue,
  formatFormData,
  sizeToM,
} from '@/helpers/yunohostArguments'
import { useStoreGetters } from '@/store/utils'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const router = useRouter()

const viewElem = ref<InstanceType<typeof ViewBase> | null>(null)

const queries = [
  ['GET', { uri: 'users', param: props.name, storeKey: 'users_details' }],
  ['GET', { uri: 'domains' }],
]
const { user, domainsAsChoices, mainDomain } = useStoreGetters()

const fields = {
  username: {
    label: t('user_username'),
    modelValue: props.name,
    props: { id: 'username', disabled: true },
  },

  fullname: {
    label: t('user_fullname'),
    props: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  },

  mail: {
    label: t('user_email'),
    props: { id: 'mail', choices: domainsAsChoices },
  },

  mailbox_quota: {
    label: t('user_mailbox_quota'),
    description: t('mailbox_quota_description'),
    example: t('mailbox_quota_example'),
    props: {
      id: 'mailbox-quota',
      placeholder: t('mailbox_quota_placeholder'),
    },
  },

  mail_aliases: {
    props: {
      placeholder: t('placeholder.username'),
      choices: domainsAsChoices,
    },
  },

  mail_forward: {
    props: {
      placeholder: t('user_new_forward'),
      type: 'email',
    },
  },

  change_password: {
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    props: {
      id: 'change_password',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  },

  confirmation: {
    label: t('password_confirmation'),
    props: {
      id: 'confirmation',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  },
}
const form = reactive({
  fullname: '',
  mail: { localPart: '', separator: '@', domain: '' },
  mailbox_quota: '',
  mail_aliases: [],
  mail_forward: [],
  change_password: '',
  confirmation: '',
})
const rules = computed(() => ({
  fullname: { required, nameValidator },
  mail: {
    localPart: { required, email: emailLocalPart },
  },
  mailbox_quota: { integer, minValue: minValue(0) },
  mail_aliases: {
    $each: helpers.forEach({
      localPart: { required, email: emailLocalPart },
    }),
  },
  mail_forward: {
    $each: helpers.forEach({
      mail: { required, emailForward },
    }),
  },
  change_password: { passwordLenght: minLength(8) },
  confirmation: { passwordMatch: sameAs(form.change_password) },
}))
const v$ = useVuelidate(rules, form)
const serverError = ref('')

function onQueriesResponse(user_) {
  form.fullname = user_.fullname
  form.mail = adressToFormValue(user_.mail)
  if (user_['mail-aliases']) {
    form.mail_aliases = user_['mail-aliases'].map((mail) =>
      adressToFormValue(mail),
    )
  }
  if (user_['mail-forward']) {
    form.mail_forward = user_['mail-forward'].map((mail) => ({ mail })) // Copy value
  }
  // mailbox-quota could be 'No quota' or 'Pas de quota'...
  if (parseInt(user_['mailbox-quota'].limit) > 0) {
    form.mailbox_quota = sizeToM(user_['mailbox-quota'].limit)
  } else {
    form.mailbox_quota = ''
  }
}

async function onSubmit() {
  const formData = await formatFormData(form, { flatten: true })
  // FIXME not sure computed can be executed?
  const user_ = user.value(props.name)
  const data = {}
  if (!Object.prototype.hasOwnProperty.call(formData, 'mailbox_quota')) {
    formData.mailbox_quota = ''
  }

  formData.mail_forward = formData.mail_forward?.map((v) => v.mail)

  for (const key of ['mail_aliases', 'mail_forward']) {
    const dashedKey = key.replace('_', '-')
    const newKey = key.replace('_', '').replace('es', '')
    const addDiff = arrayDiff(formData[key], user_[dashedKey])
    const rmDiff = arrayDiff(user_[dashedKey], formData[key])
    if (addDiff.length) data['add_' + newKey] = addDiff
    if (rmDiff.length) data['remove_' + newKey] = rmDiff
  }

  for (const key in formData) {
    if (key === 'mailbox_quota') {
      const quota =
        parseInt(formData[key]) > 0 ? formData[key] + 'M' : 'No quota'
      if (parseInt(quota) !== parseInt(user_['mailbox-quota'].limit)) {
        data[key] = quota === 'No quota' ? '0' : quota
      }
    } else if (!key.includes('mail_') && formData[key] !== user_[key]) {
      data[key] = formData[key]
    }
  }

  if (Object.keys(data).length === 0) {
    serverError.value = t('error_modify_something')
    return
  }

  api
    .put({ uri: 'users', param: props.name, storeKey: 'users_details' }, data, {
      key: 'users.update',
      name: props.name,
    })
    .then(() => {
      router.push({ name: 'user-info', param: { name: props.name } })
    })
    .catch((err) => {
      if (err.name !== 'APIBadRequestError') throw err
      serverError.value = err.message
    })
}

function addEmailField(type: 'aliases' | 'forward') {
  form['mail_' + type].push(
    type === 'aliases'
      ? { localPart: '', separator: '@', domain: mainDomain.value }
      : { mail: '' },
  )
  // Focus last input after rendering update
  nextTick(() => {
    const inputs = viewElem.value!.$el.querySelectorAll(`#mail-${type} input`)
    inputs[inputs.length - 1].focus()
  })
}

function removeEmailField(type: 'aliases' | 'forward', index: number) {
  form['mail_' + type].splice(index, 1)
}
</script>

<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardFormSkeleton"
    ref="viewElem"
  >
    <CardForm
      :title="$t('user_username_edit', { name })"
      icon="user"
      :validation="v$"
      :server-error="serverError"
      @submit.prevent="onSubmit"
    >
      <!-- USERNAME (disabled) -->
      <FormField v-bind="fields.username" />

      <!-- USER FULLNAME -->
      <FormField
        v-bind="fields.fullname"
        v-model="form.fullname"
        :validation="v$.form.fullname"
      />

      <hr />

      <!-- USER EMAIL -->
      <FormField v-bind="fields.mail" :validation="v$.form.mail">
        <template #default="{ self }">
          <AdressInputSelect v-bind="self" v-model="form.mail" />
        </template>
      </FormField>

      <!-- MAILBOX QUOTA -->
      <FormField
        v-bind="fields.mailbox_quota"
        :validation="v$.form.mailbox_quota"
      >
        <template #default="{ self }">
          <BInputGroup append="M">
            <InputItem v-bind="self" v-model="form.mailbox_quota" />
          </BInputGroup>
        </template>
      </FormField>
      <hr />

      <!-- MAIL ALIASES -->
      <FormField :label="$t('user_emailaliases')" id="mail-aliases">
        <div v-for="(mail, i) in form.mail_aliases" :key="i" class="mail-list">
          <FormField
            v-bind="fields.mail_aliases"
            :id="'mail_aliases' + i"
            :validation="v$.form.mail_aliases"
            :validation-index="i"
          >
            <template #default="{ self }">
              <AdressInputSelect v-bind="self" v-model="form.mail_aliases[i]" />
            </template>
          </FormField>

          <BButton variant="danger" @click="removeEmailField('aliases', i)">
            <YIcon :title="$t('delete')" iname="trash-o" />
            <span class="visually-hidden">{{ $t('delete') }}</span>
          </BButton>
        </div>

        <BButton variant="success" @click="addEmailField('aliases')">
          <YIcon iname="plus" /> {{ $t('user_emailaliases_add') }}
        </BButton>
      </FormField>

      <!-- MAIL FORWARD -->
      <FormField :label="$t('user_emailforward')" id="mail-forward">
        <div v-for="(mail, i) in form.mail_forward" :key="i" class="mail-list">
          <FormField
            v-bind="fields.mail_forward"
            v-model="form.mail_forward[i].mail"
            :id="'mail-forward' + i"
            :validation="v$.form.mail_forward"
            :validation-index="i"
          />

          <BButton variant="danger" @click="removeEmailField('forward', i)">
            <YIcon :title="$t('delete')" iname="trash-o" />
            <span class="visually-hidden">{{ $t('delete') }}</span>
          </BButton>
        </div>

        <BButton variant="success" @click="addEmailField('forward')">
          <YIcon iname="plus" /> {{ $t('user_emailforward_add') }}
        </BButton>
      </FormField>
      <hr />

      <!-- USER PASSWORD -->
      <FormField
        v-bind="fields.change_password"
        v-model="form.change_password"
        :validation="v$.form.change_password"
      />

      <!-- USER PASSWORD CONFIRMATION -->
      <FormField
        v-bind="fields.confirmation"
        v-model="form.confirmation"
        :validation="v$.form.confirmation"
      />
    </CardForm>
  </ViewBase>
</template>

<style lang="scss" scoped>
.mail-list {
  display: flex;
  justify-items: stretch;

  .btn-danger {
    align-self: flex-start;
    margin-left: 0.5rem;
  }
}
</style>
