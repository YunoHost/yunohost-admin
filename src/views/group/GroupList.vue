<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import TagsSelectizeItem from '@/components/globals/formItems/TagsSelectizeItem.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInfos } from '@/composables/useInfos'
import { useSearch } from '@/composables/useSearch'
import { toEntries } from '@/helpers/commons'
import type { Obj } from '@/types/commons'
import type { Group, Permission, UserItem } from '@/types/core/data'
import type { TagUpdateArgs } from '@/types/form'

// TODO add global search with type (search by: group, user, permission)
// TODO add vuex store update on inputs ?

const { t } = useI18n()
const modalConfirm = useAutoModal()
const { currentUser } = useInfos()

const {
  primaryGroups,
  userGroups,
  permissionOptions,
  userOptions,
  activeUserGroups,
} = await api
  .fetchAll<[Obj<UserItem>, Obj<Group>, Obj<Permission>]>([
    { uri: 'users', cachePath: 'users' },
    {
      uri: 'users/groups?full&include_primary_groups',
      cachePath: 'groups',
    },
    { uri: 'users/permissions?full', cachePath: 'permissions' },
  ])
  .then(([users, groups, permsDict]) => {
    type DGroup = Group & {
      members: string[]
      name: string
      isSpecial?: boolean
      disabledItems?: string[]
    }
    const permIds = Object.keys(permsDict)
    const userNames = users ? Object.keys(users) : []
    const specialGroupsFilters = {
      visitors: (id: string) => permsDict[id].protected,
      all_users: (id: string) => ['ssh.main', 'sftp.main'].includes(id),
      admins: (id: string) => ['ssh.main', 'sftp.main'].includes(id),
    }

    function isSpecialGroup(
      name: string,
    ): name is 'visitors' | 'all_users' | 'admins' {
      return ['visitors', 'all_users', 'admins'].includes(name)
    }

    const { primaryGroups, userGroups } = toEntries(groups).reduce(
      (g, [name, data]) => {
        const group: DGroup = {
          name,
          // Clone data to avoid mutating the cache
          members: [...data.members],
          permissions: [...data.permissions],
        }

        if (userNames.includes(name)) {
          g.userGroups[name] = group
        } else {
          if (isSpecialGroup(name)) {
            group.isSpecial = true
            // Forbid to add or remove a protected permission on group `visitors`
            // Forbid to add ssh and sftp permission on group `all_users` and `admins`
            group.disabledItems = permIds.filter(specialGroupsFilters[name])
          }
          g.primaryGroups.push(group)
        }

        return g
      },
      { primaryGroups: [] as DGroup[], userGroups: {} as Obj<DGroup> },
    )

    return {
      primaryGroups: ref(primaryGroups),
      userGroups: reactive(userGroups),
      permissionOptions: permIds.map((id) => ({
        value: id,
        text: permsDict[id].label,
      })),
      userOptions: userNames,
      activeUserGroups: ref(
        Object.values(userGroups)
          .filter((group) => group.permissions.length > 0)
          .map((group) => group.name),
      ),
    }
  })

const [search, filteredGroups] = useSearch(primaryGroups, (s, group) => {
  return group.name.toLowerCase().includes(s)
})

async function onPermissionChanged(
  { tag: perm, action, applyFn }: TagUpdateArgs,
  name: string,
) {
  if (action === 'add' && ['sftp.main', 'ssh.main'].includes(perm)) {
    const confirmed = await modalConfirm(
      t('confirm_group_add_access_permission', { name, perm }),
    )
    if (!confirmed) return
  }

  api
    .put({
      uri: `users/permissions/${perm}/${action}/${name}`,
      cachePath: `permissions.${perm}`,
    })
    .then(() => applyFn(perm))
}

async function onUserChanged(
  { tag: user, action, applyFn }: TagUpdateArgs,
  name: string,
) {
  if (name === 'admins' && action === 'remove' && user === currentUser.value) {
    const confirmed = await modalConfirm(
      t('groups.remove_user.confirm_from_admins'),
    )
    if (!confirmed) return
  }

  api
    .put({
      uri: `users/groups/${name}/${action}/${user}`,
      cachePath: `groups.${name}`,
    })
    .then(() => applyFn(user))
}

async function deleteGroup(name: string) {
  const confirmed = await modalConfirm(t('confirm_delete', { name }))
  if (!confirmed) return

  api
    .delete({ uri: `users/groups/${name}`, cachePath: `groups.${name}` })
    .then(() => {
      primaryGroups.value = primaryGroups.value.filter(
        (group) => group.name !== name,
      )
    })
}
</script>

<template>
  <ViewSearch
    v-model="search"
    :items="filteredGroups"
    items-name="groups"
    skeleton="CardFormSkeleton"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'group-create' }">
        <YIcon iname="plus" /> {{ $t('group_add') }}
      </BButton>
    </template>

    <!-- PRIMARY GROUPS CARDS -->
    <!--
      i18n: group_admins
      i18n: group_all_users
      i18n: group_visitors
    -->
    <YCard
      v-for="group in filteredGroups"
      :key="group.name"
      collapsible
      :title="
        group.isSpecial
          ? $t('group_' + group.name)
          : `${$t('group')} '${group.name}'`
      "
      icon="group"
    >
      <template #header-buttons>
        <!-- DELETE GROUP -->
        <BButton
          v-if="!group.isSpecial"
          size="sm"
          variant="danger"
          @click="deleteGroup(group.name)"
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
              <!--
                i18n: group_explain_admins
                i18n: group_explain_all_users
                i18n: group_explain_visitors
              -->
              {{ $t('group_explain_' + group.name) }}
            </p>
            <p v-if="group.name === 'visitors'" class="text-primary-emphasis">
              <em>{{
                $t('group_explain_visitors_needed_for_external_client')
              }}</em>
            </p>
          </template>
          <template v-if="group.name == 'admins' || !group.isSpecial">
            <TagsSelectizeItem
              :id="group.name + '-users'"
              v-model="group.members"
              :options="userOptions"
              :label="$t('group_add_member')"
              tag-icon="user"
              items-name="users"
              @tag-update="onUserChanged($event, group.name)"
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
            :id="group.name + '-perms'"
            v-model="group.permissions"
            :options="permissionOptions"
            :label="$t('group_add_permission')"
            tag-icon="key-modern"
            items-name="permissions"
            :disabled-items="group.disabledItems"
            @tag-update="onPermissionChanged($event, group.name)"
          />
        </BCol>
      </BRow>
    </YCard>

    <!-- USER GROUPS CARD -->
    <YCard collipsable :title="$t('group_specific_permissions')" icon="group">
      <template v-for="userName in activeUserGroups" :key="userName">
        <BRow>
          <BCol md="3" lg="2">
            <YIcon iname="user" /> <strong>{{ userName }}</strong>
          </BCol>

          <BCol>
            <TagsSelectizeItem
              :id="userName + '-perms'"
              v-model="userGroups[userName].permissions"
              :options="permissionOptions"
              :label="$t('group_add_permission')"
              tag-icon="key-modern"
              items-name="permissions"
              @tag-update="onPermissionChanged($event, userName)"
            />
          </BCol>
        </BRow>
        <hr />
      </template>

      <TagsSelectizeItem
        id="user-groups"
        v-model="activeUserGroups"
        auto
        :options="userOptions"
        :label="$t('group_add_member')"
        no-tags
        items-name="users"
      />
    </YCard>
  </ViewSearch>
</template>

<style lang="scss" scoped>
.row > div:first-child {
  margin-bottom: 1rem;
}
</style>
