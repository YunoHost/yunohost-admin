<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { useStoreGetters } from '@/store/utils'

const store = useStore()
const { loading } = useInitialQueries([
  [
    'GET',
    {
      uri: 'users?fields=username&fields=fullname&fields=mail&fields=mailbox-quota&fields=groups',
      storeKey: 'users',
    },
  ],
])
const { users } = useStoreGetters()

const search = ref('')
const filteredUsers = computed(() => {
  if (!users.value) return
  const search_ = search.value.toLowerCase()
  const filtered = users.value.filter((user) => {
    return (
      user.username.toLowerCase().includes(search_) ||
      user.groups.includes(search_)
    )
  })
  return filtered.length === 0 ? null : filtered
})

function downloadExport() {
  const host = store.getters.host
  window.open(`https://${host}/yunohost/api/users/export`, '_blank')
}
</script>

<template>
  <ViewSearch
    v-model:search="search"
    :filtered-items="filteredUsers"
    :items="users"
    items-name="users"
    :loading="loading"
  >
    <template #top-bar-buttons>
      <BButton variant="info" :to="{ name: 'group-list' }">
        <YIcon iname="key-modern" /> {{ $t('groups_and_permissions_manage') }}
      </BButton>

      <BDropdown
        :split-to="{ name: 'user-create' }"
        split
        variant="outline-success"
        right
        split-variant="success"
      >
        <template #button-content>
          <YIcon iname="plus" /> {{ $t('users_new') }}
        </template>
        <BDropdownItem :to="{ name: 'user-import' }">
          <YIcon iname="plus" /> {{ $t('users_import') }}
        </BDropdownItem>
        <BDropdownItem @click="downloadExport">
          <YIcon iname="download" /> {{ $t('users_export') }}
        </BDropdownItem>
      </BDropdown>
    </template>

    <BListGroup>
      <BListGroupItem
        v-for="user in filteredUsers"
        :key="user.username"
        :to="{ name: 'user-info', params: { name: user.username } }"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <div>
          <h5 class="fw-bold">
            {{ user.username }}
            <small class="text-secondary">{{ user.fullname }}</small>
          </h5>
          <p class="m-0">
            {{ user.mail }}
          </p>
        </div>
        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </ViewSearch>
</template>
