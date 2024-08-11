<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import type ViewBase from '@/components/globals/ViewBase.vue'
import { useDomains, useUsersAndGroups } from '@/composables/data'
import { useArrayRule, useForm } from '@/composables/form'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { arrayDiff } from '@/helpers/commons'
import {
  emailForward,
  emailLocalPart,
  integer,
  minLength,
  minValue,
  name as nameValidator,
  required,
  sameAs,
} from '@/helpers/validators'
import { formatAdress, formatForm, sizeToM } from '@/helpers/yunohostArguments'
import type { AdressModelValue, FieldProps, FormFieldDict } from '@/types/form'

const props = defineProps<{
  name: string
}>()

const { t } = useI18n()
const router = useRouter()
const { loading } = useInitialQueries(
  [
    {
      uri: `users/${props.name}`,
      cachePath: `userDetails.${props.name}`,
    },
    { uri: 'domains', cachePath: 'domains' },
  ],
  { onQueriesResponse },
)

const viewElem = ref<InstanceType<typeof ViewBase> | null>(null)

const { domainsAsChoices, mainDomain } = useDomains()

type Form = typeof form.value
const form = ref({
  username: props.name,
  fullname: '',
  mail: { localPart: '', separator: '@', domain: '' } as AdressModelValue,
  mailbox_quota: '' as string | number,
  mail_aliases: [] as AdressModelValue[],
  mail_forward: [] as string[],
  change_password: '',
  confirmation: '',
})
const fields = reactive({
  username: {
    component: 'InputItem',
    label: t('user_username'),
    cProps: { id: 'username', disabled: true },
  } satisfies FieldProps<'InputItem', Form['username']>,

  fullname: {
    component: 'InputItem',
    label: t('user_fullname'),
    rules: { required, nameValidator },
    cProps: {
      id: 'fullname',
      placeholder: t('placeholder.fullname'),
    },
  } satisfies FieldProps<'InputItem', Form['fullname']>,

  mail: reactive({
    component: 'AdressItem',
    label: t('user_email'),
    rules: { localPart: { required, email: emailLocalPart } },
    cProps: { id: 'mail', choices: domainsAsChoices },
  }) satisfies FieldProps<'AdressItem', Form['mail']>,

  mailbox_quota: {
    append: 'M',
    component: 'InputItem',
    label: t('user_mailbox_quota'),
    description: t('mailbox_quota_description'),
    // example: t('mailbox_quota_example'),
    rules: { integer, minValue: minValue(0) },
    cProps: {
      id: 'mailbox-quota',
      placeholder: t('mailbox_quota_placeholder'),
    },
  } satisfies FieldProps<'InputItem', Form['mailbox_quota']>,

  mail_aliases: reactive({
    component: 'AdressItem',
    rules: useArrayRule(() => form.value.mail_aliases, {
      localPart: { required, email: emailLocalPart },
    }),
    cProps: {
      placeholder: t('placeholder.username'),
      choices: domainsAsChoices,
    },
  }) satisfies FieldProps<'AdressItem', Form['mail_aliases']>,

  mail_forward: reactive({
    component: 'InputItem',
    rules: useArrayRule(() => form.value.mail_forward, {
      required,
      emailForward,
    }),
    cProps: {
      placeholder: t('user_new_forward'),
      type: 'email',
    },
  }) satisfies FieldProps<'InputItem', Form['mail_forward']>,

  change_password: {
    component: 'InputItem',
    label: t('password'),
    description: t('good_practices_about_user_password'),
    descriptionVariant: 'warning',
    rules: { passwordLenght: minLength(8) },
    cProps: {
      id: 'change_password',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  } satisfies FieldProps<'InputItem', Form['change_password']>,

  confirmation: reactive({
    component: 'InputItem',
    label: t('password_confirmation'),
    rules: computed(() => ({
      passwordMatch: sameAs(form.value.change_password),
    })),
    cProps: {
      id: 'confirmation',
      type: 'password',
      placeholder: '••••••••',
      autocomplete: 'new-password',
    },
  }) satisfies FieldProps<'InputItem', Form['confirmation']>,
} satisfies FormFieldDict<Form>)

const { v, onSubmit } = useForm(form, fields)

function onQueriesResponse(user_: any) {
  form.value.fullname = user_.fullname
  form.value.mail = formatAdress(user_.mail)
  if (user_['mail-aliases']) {
    form.value.mail_aliases = user_['mail-aliases'].map((mail) =>
      formatAdress(mail),
    )
  }
  if (user_['mail-forward']) {
    form.value.mail_forward = user_['mail-forward'].map((mail) => ({ mail })) // Copy value
  }
  // mailbox-quota could be 'No quota' or 'Pas de quota'...
  if (parseInt(user_['mailbox-quota'].limit) > 0) {
    form.value.mailbox_quota = sizeToM(user_['mailbox-quota'].limit)
  } else {
    form.value.mailbox_quota = ''
  }
}

const onUserEdit = onSubmit(async (onError, serverErrors) => {
  const { username: _, ...formData } = await formatForm(form, {
    removeEmpty: true,
  })
  const user_ = useUsersAndGroups(props.name).user.value!
  const data = {}
  if (!Object.prototype.hasOwnProperty.call(formData, 'mailbox_quota')) {
    formData.mailbox_quota = ''
  }

  // formData.mail_forward = formData.mail_forward?.map((v) => v.mail)

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
    serverErrors.global = [t('error_modify_something')]
    return
  }

  api
    .put({
      uri: `users/${props.name}`,
      cachePath: `userDetails.${props.name}`,
      data,
      humanKey: { key: 'users.update', name: props.name },
    })
    .then(() => {
      router.push({ name: 'user-info', params: { name: props.name } })
    })
    .catch(onError)
})
</script>

<template>
  <ViewBase ref="viewElem" :loading="loading" skeleton="CardFormSkeleton">
    <CardForm
      v-model="form"
      icon="user"
      :fields="fields"
      :title="$t('user_username_edit', { name })"
      :validations="v"
      @submit.prevent="onUserEdit"
    >
      <template #field:mail_aliases="fieldProps">
        <FormFieldMultiple
          v-bind="fieldProps"
          v-model="form.mail_aliases"
          :add-btn-text="t('user_emailaliases_add')"
          :default-value="
            () => ({
              localPart: '',
              separator: '@',
              domain: mainDomain,
            })
          "
          :validation="v.form.mail_aliases"
        />
      </template>

      <template #field:mail_forward="fieldProps">
        <FormFieldMultiple
          v-bind="fieldProps"
          v-model="form.mail_forward"
          :add-btn-text="t('user_emailforward_add')"
          :default-value="() => ''"
          :validation="v.form.mail_forward"
        />
      </template>
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
