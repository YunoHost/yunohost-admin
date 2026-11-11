<script setup lang="ts">
import api from '@/api'
import { useUsersAndGroups } from '@/composables/data'
import { useInfos } from '@/composables/useInfos'
import { useSearch } from '@/composables/useSearch'

const [n_invitations, n_registration_requests] = await api.fetchAll([
  { uri: 'users?fields=username&fields=fullname&fields=mail&fields=mailbox-quota&fields=groups', cachePath: 'users' },
  { uri: 'users/invitations?raw' },
  { uri: 'users/registrations?raw' },
]).then(([{}, { invitations }, { registration_requests }]) => [ invitations.length, registration_requests.length ])

const { users } = useUsersAndGroups()
const [search, filteredUsers] = useSearch(
  users,
  (s, user) =>
    user.username.toLowerCase().includes(s) || user.groups.includes(s),
)

function downloadExport() {
  const { host } = useInfos()
  window.open(`https://${host.value}/yunohost/api/users/export`, '_blank')
}
</script>

<template>
  <ViewSearch v-model="search" :items="filteredUsers" items-name="users">
    <template #top-bar-buttons>
      <BButton v-if="n_registration_requests" variant="outline-info" :to="{ name: 'user-registration-requests' }">
        {{ n_registration_requests + " " + $t('items.registration_requests', n_registration_requests) }}
      </BButton>
      <BButton v-if="n_invitations" variant="outline-info" :to="{ name: 'user-invitations' }">
        {{ n_invitations + " " + $t('items.invitations', n_invitations) }}
      </BButton>
      <BDropdown
        :split-to="{ name: 'user-create' }"
        split
        variant="outline-success"
        right
        split-variant="success"
      >
        <template #button-content>
          <YIcon iname="plus" /> {{ $t('users_add') }}
        </template>
        <BDropdownItem :to="{ name: 'user-invitations-new' }">
          <YIcon iname="plus" /> {{ $t('users_invite') }}
        </BDropdownItem>
        <BDropdownItem :to="{ name: 'user-import' }">
          <YIcon iname="plus" /> {{ $t('users_import') }}
        </BDropdownItem>
        <BDropdownItem @click="downloadExport">
          <YIcon iname="download" /> {{ $t('users_export') }}
        </BDropdownItem>
      </BDropdown>
    </template>

    <BListGroup>
      <YListItem
        v-for="user in filteredUsers"
        :key="user.username"
        :to="{ name: 'user-info', params: { name: user.username } }"
        :label="user.username"
        :sublabel="user.fullname"
        :description="user.mail"
      />
    </BListGroup>
  </ViewSearch>
</template>
