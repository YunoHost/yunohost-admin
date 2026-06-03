<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { formatDuration } from 'date-fns/formatDuration'
import { dateFnsLocale as locale } from '@/i18n/helpers'

import api from '@/api'
import { useDomains, useUsersAndGroups, usePermissions } from '@/composables/data'
import { useForm } from '@/composables/form'
import TagsSelectizeItem from '@/components/globals/formItems/TagsSelectizeItem.vue'
import {
  alphalownumdot_,
  emailForward,
  integer,
  minValue,
  required,
  unique,
} from '@/helpers/validators'

import { formatForm } from '@/helpers/yunohostArguments'
import type { FieldProps, FileModelValue, FormFieldDict } from '@/types/form'

const { t } = useI18n()
const router = useRouter()

await api.fetchAll([
  { uri: 'domains', cachePath: 'domains' },
  { uri: 'users', cachePath: 'users' },
  { uri: 'users/groups?full&include_primary_groups', cachePath: 'groups' },
  { uri: 'users/permissions?full', cachePath: 'permissions' },
])

const { usernames, groups, groupsToPermissions, groupsOptions } = useUsersAndGroups()
const { permissions, permissionsOptions } = usePermissions()
const { mainDomainsAsChoices, mainDomain } = useDomains()

function perm_related_to_domain(perm_key, domain) {
    const perm = permissions.value[perm_key];
    if ((perm === undefined) || (perm.url === undefined)) {
        return true
    }
    const url_domain = perm.url.split("/")[0];
    return url_domain == domain || url_domain.endsWith("." + domain)
}

const inheritedPermissions = computed(() => {
    const selected_groups = form.value.groups;
    const selected_domain = form.value.domain;
    const groups = ["all_users", ...selected_groups];
    const inheritedPermissions = Array.from(new Set(
      groups.flatMap(g => groupsToPermissions.value[g] || [])
    )).filter((p) => perm_related_to_domain(p, selected_domain));
    return inheritedPermissions
})

type Form = typeof form.value
const form = ref({
  force_username: false,
  username: "",
  domain: mainDomain.value,
  groups: [],
  inheritedPermissions: inheritedPermissions,
  external_email: "",
  send_invite_via_email: false,
  notify_admins_when_invite_is_consumed: true,
  validity: 7*24, // 7 days
})


const fields = {

  force_username: {
    label: t('users_invite_force_username'),
    component: 'CheckboxItem',
    cProps: { id: 'force_username', labels: { true: 'username_forced_by_admin', false: 'username_chosen_by_invitee' } },
    rules: {},
  } satisfies FieldProps<'CheckboxItem', Form['force_username']>,

  username: reactive({
    component: 'InputItem',
    label: t('user_username'),
    rules: computed(() => ({
      alphalownumdot_,
      notInUsers: unique(usernames),
      ... form.value.force_username && { required }
    })),
    visible: computed(() => form.value.force_username),
    cProps: {
      id: 'username',
      autocapitalize: 'off',
      spellcheck: 'false',
    },
  }) satisfies FieldProps<'InputItem', Form['username']>,

  domain: reactive({
    component: 'SelectItem',
    hr: true,
    id: 'domain',
    label: t('user_domain_in_invite'),
    description: t('tip_about_domain_in_user_invite'),
    rules: { required },
    cProps: { choices: mainDomainsAsChoices },
  }) satisfies FieldProps<'SelectItem', Form['domain']>,

  groups: reactive({
    component: 'TagsSelectizeItem',
    label: t('user_groups'),
    id: 'groups',
    rules: { },
    cProps: {
      options: groupsOptions,
      auto: true,
      'tag-icon': "users",
      'items-name': "groups"
    },
  }) satisfies FieldProps<'TagsSelectizeItem', Form['groups']>,

  inheritedPermissions: reactive({
    component: 'TagsSelectizeItem',
    id: 'inheritedPermissions',
    label: t('user_invite_inherited_permissions'),
    description: t('user_invite_inherited_permissions_explanation'),
    rules: { },
    hr: true,
  }) satisfies FieldProps<'TagsSelectizeItem', Form['groups']>,

  external_email: reactive({
    component: 'InputItem',
    id: 'external_email',
    label: t('user_invite_external_email'),
    description: t('user_invite_external_email_explanation'),
    rules: { emailForward },
    cProps: {
      placeholder: t('user_new_forward'),
      type: 'email',
    },
  }) satisfies FieldProps<'InputItem', Form['external_email']>,

  send_invite_via_email: {
    label: t('user_invite_send_via_email'),
    description: t('user_invite_send_via_email_explanation'),
    component: 'CheckboxItem',
    cProps: { id: 'send_invite_via_email' },
    rules: {},
    cProps: {
        disabled: computed(() => (! form.value.external_email)),
    }
  } satisfies FieldProps<'CheckboxItem', Form['send_invite_via_email']>,

  validity: reactive({
    component: 'SelectItem',
    id: 'validity',
    label: t('user_invite_validity'),
    rules: { required },
    cProps: {
        choices: [
            {value: 1,  text: formatDuration({hours: 1}, { locale }) },
            {value: 3,  text: formatDuration({hours: 3}, { locale }) },
            {value: 24, text: formatDuration({days: 1}, { locale }) },
            {value: 24*3, text: formatDuration({days: 3}, { locale }) },
            {value: 24*7, text: formatDuration({days: 7}, { locale }) },
            {value: 24*30, text: formatDuration({days: 30}, { locale }) },
        ]
    },
  }) satisfies FieldProps<'SelectItem', Form['validity']>,

  notify_admins_when_invite_is_consumed: {
    label: t('user_invite_notify_admins'),
    description: t('user_invite_notify_admins_explanation'),
    component: 'CheckboxItem',
    cProps: { id: 'notify_admins_when_invite_is_consumed' },
    rules: {},
  } satisfies FieldProps<'CheckboxItem', Form['notify_admins_when_invite_is_consumed']>,
    

} satisfies FormFieldDict<Form>

const { v, onSubmit } = useForm(form, fields)

const onUserInvite = onSubmit(async (onError) => {
  const data = await formatForm(form)
  delete data.inheritedPermissions;
  if (! data.force_username) {
      delete data.username;
  }
  delete data.force_username;
  if (! data.external_email) {
     delete data.external_email;
  }
  api.post({ uri: 'users/invitations', data })
    .then(() => {
      router.push({ name: 'user-invitations' })
    })
    .catch(onError)
})
</script>

<template>
  <div>
    <CardForm
      v-model="form"
      icon="user-plus"
      :fields="fields"
      :title="$t('users_invite')"
      :validations="v"
      @submit.prevent="onUserInvite"
    >
      <template #component:domain="componentProps">
        <BInputGroup>
          <BInputGroupText id="local-part" tag="label" class="border-right-0">
            {{ form.username || t('user_username').toLowerCase().replace(/\s+/g, '') }}@
          </BInputGroupText>

          <SelectItem v-bind="componentProps" v-model="form.domain" />
        </BInputGroup>
      </template>
      <template #component:inheritedPermissions="componentProps">
        <TagsSelectizeItem
          id="inheritedPermissions"
          v-model="inheritedPermissions"
          :options="permissionsOptions"
          :readonly="true"
          tag-icon="key"
          items-name="permissions"
        />
      </template>
    </CardForm>
  </div>
</template>

<style lang="scss" scoped>
.card {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
