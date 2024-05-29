<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import TagsSelectizeItem from '@/components/globals/formItems/TagsSelectizeItem.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { isEmptyValue } from '@/helpers/commons'

// TODO add global search with type (search by: group, user, permission)
// TODO add vuex store update on inputs ?

const { t } = useI18n()
const modalConfirm = useAutoModal()

const queries = [
  ['GET', { uri: 'users' }],
  [
    'GET',
    {
      uri: 'users/groups?full&include_primary_groups',
      storeKey: 'groups',
    },
  ],
  ['GET', { uri: 'users/permissions?full', storeKey: 'permissions' }],
]
const search = ref('')
const permissions = ref()
const permissionsOptions = ref()
const primaryGroups = ref()
const userGroups = ref()
const usersOptions = ref()
const activeUserGroups = ref()

const filteredGroups = computed(() => {
  const groups = primaryGroups.value
  if (!groups) return
  const search_ = search.value.toLowerCase()
  const filtered = {}
  for (const groupName in groups) {
    if (groupName.toLowerCase().includes(search_)) {
      filtered[groupName] = groups[groupName]
    }
  }
  return isEmptyValue(filtered) ? null : filtered
})

function onQueriesResponse(users, allGroups, permsDict) {
  // Do not use computed properties to get values from the store here to avoid auto
  // updates while modifying values.
  const permissions_ = Object.entries(permsDict).map(([id, value]) => ({
    id,
    ...value,
  }))
  const userNames = users ? Object.keys(users) : []
  const primaryGroups_ = {}
  const userGroups_ = {}

  for (const groupName in allGroups) {
    // copy the group to unlink it from the store
    const group_ = { ...allGroups[groupName] }
    group_.permissions = group_.permissions.map((perm) => {
      return permsDict[perm].label
    })

    if (userNames.includes(groupName)) {
      userGroups_[groupName] = group_
      continue
    }

    group_.isSpecial = ['visitors', 'all_users', 'admins'].includes(groupName)

    if (groupName === 'visitors') {
      // Forbid to add or remove a protected permission on group `visitors`
      group_.disabledItems = permissions_
        .filter(({ id }) => {
          return (
            ['mail.main', 'xmpp.main'].includes(id) || permsDict[id].protected
          )
        })
        .map(({ id }) => permsDict[id].label)
    }

    if (groupName === 'all_users') {
      // Forbid to add ssh and sftp permission on group `all_users`
      group_.disabledItems = permissions_
        .filter(({ id }) => {
          return ['ssh.main', 'sftp.main'].includes(id)
        })
        .map(({ id }) => permsDict[id].label)
    }

    if (groupName === 'admins') {
      // Forbid to add ssh and sftp permission on group `admins`
      group_.disabledItems = permissions_
        .filter(({ id }) => {
          return ['ssh.main', 'sftp.main'].includes(id)
        })
        .map(({ id }) => permsDict[id].label)
    }

    primaryGroups_[groupName] = group_
  }

  const activeUserGroups_ = Object.entries(userGroups_)
    .filter(([_, group]) => {
      return group.permissions.length > 0
    })
    .map(([name]) => name)

  permissions.value = permissions_
  permissionsOptions.value = permissions_.map((perm) => perm.label)
  primaryGroups.value = primaryGroups_
  userGroups.value = isEmptyValue(userGroups_) ? null : userGroups_
  usersOptions.value = userNames
  activeUserGroups.value = activeUserGroups_
}

async function onPermissionChanged({ option, groupName, action, applyMethod }) {
  const permId = permissions.value.find((perm) => perm.label === option).id
  if (action === 'add' && ['sftp.main', 'ssh.main'].includes(permId)) {
    const confirmed = await modalConfirm(
      t('confirm_group_add_access_permission', {
        name: groupName,
        perm: option,
      }),
    )
    if (!confirmed) return
  }
  api
    .put(
      // FIXME hacky way to update the store
      {
        uri: `users/permissions/${permId}/${action}/${groupName}`,
        storeKey: 'permissions',
        groupName,
        action,
        permId,
      },
      {},
      { key: 'permissions.' + action, perm: option, name: groupName },
    )
    .then(() => applyMethod(option))
}

function onUserChanged({ option, groupName, action, applyMethod }) {
  api
    .put(
      {
        uri: `users/groups/${groupName}/${action}/${option}`,
        storeKey: 'groups',
        groupName,
      },
      {},
      { key: 'groups.' + action, user: option, name: groupName },
    )
    .then(() => applyMethod(option))
}

function onSpecificUserAdded({ option: userName, action, applyMethod }) {
  if (action === 'add') {
    userGroups.value[userName].permissions = []
    applyMethod(userName)
  }
}

async function deleteGroup(groupName) {
  const confirmed = await modalConfirm(t('confirm_delete', { name: groupName }))
  if (!confirmed) return

  api
    .delete(
      { uri: 'users/groups', param: groupName, storeKey: 'groups' },
      {},
      { key: 'groups.delete', name: groupName },
    )
    .then(() => {
      delete primaryGroups.value[groupName]
    })
}
</script>

<template>
  <ViewSearch
    items-name="groups"
    v-model:search="search"
    :items="primaryGroups"
    :filtered-items="filteredGroups"
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardFormSkeleton"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'group-create' }">
        <YIcon iname="plus" /> {{ $t('group_new') }}
      </BButton>
    </template>

    <!-- PRIMARY GROUPS CARDS -->
    <YCard
      v-for="(group, groupName) in filteredGroups"
      :key="groupName"
      collapsable
      :title="
        group.isSpecial
          ? $t('group_' + groupName)
          : `${$t('group')} '${groupName}'`
      "
      icon="group"
    >
      <template #header-buttons>
        <!-- DELETE GROUP -->
        <BButton
          v-if="!group.isSpecial"
          @click="deleteGroup(groupName)"
          size="sm"
          variant="danger"
        >
          <YIcon iname="trash-o" /> {{ $t('delete') }}
        </BButton>
      </template>

      <BRow>
        <BCol md="3" lg="2">
          <strong>{{ $t('users') }}</strong>
        </BCol>
        <BCol>
          <template v-if="group.isSpecial">
            <p class="text-primary-emphasis">
              <YIcon iname="info-circle" />
              {{ $t('group_explain_' + groupName) }}
            </p>
            <p class="text-primary-emphasis" v-if="groupName === 'visitors'">
              <em>{{
                $t('group_explain_visitors_needed_for_external_client')
              }}</em>
            </p>
          </template>
          <template v-if="groupName == 'admins' || !group.isSpecial">
            <TagsSelectizeItem
              v-model="group.members"
              :options="usersOptions"
              :id="groupName + '-users'"
              :label="$t('group_add_member')"
              tag-icon="user"
              items-name="users"
              @tag-update="onUserChanged({ ...$event, groupName })"
            />
          </template>
        </BCol>
      </BRow>
      <hr />

      <BRow>
        <BCol md="3" lg="2">
          <strong>{{ $t('permissions') }}</strong>
        </BCol>
        <BCol>
          <TagsSelectizeItem
            v-model="group.permissions"
            :options="permissionsOptions"
            :id="groupName + '-perms'"
            :label="$t('group_add_permission')"
            tag-icon="key-modern"
            items-name="permissions"
            @tag-update="onPermissionChanged({ ...$event, groupName })"
            :disabled-items="group.disabledItems"
          />
        </BCol>
      </BRow>
    </YCard>

    <!-- USER GROUPS CARD -->
    <YCard
      v-if="userGroups"
      collapsable
      :title="$t('group_specific_permissions')"
      icon="group"
    >
      <template v-for="userName in activeUserGroups" :key="userName">
        <BRow>
          <BCol md="3" lg="2">
            <YIcon iname="user" /> <strong>{{ userName }}</strong>
          </BCol>

          <BCol>
            <TagsSelectizeItem
              v-model="userGroups[userName].permissions"
              :options="permissionsOptions"
              :id="userName + '-perms'"
              :label="$t('group_add_permission')"
              tag-icon="key-modern"
              items-name="permissions"
              @tag-update="
                onPermissionChanged({ ...$event, groupName: userName })
              "
            />
          </BCol>
        </BRow>
        <hr />
      </template>

      <TagsSelectizeItem
        v-model="activeUserGroups"
        :options="usersOptions"
        id="user-groups"
        :label="$t('group_add_member')"
        no-tags
        items-name="users"
        @tag-update="onSpecificUserAdded"
      />
    </YCard>
  </ViewSearch>
</template>

<style lang="scss" scoped>
.row > div:first-child {
  margin-bottom: 1rem;
}
</style>
