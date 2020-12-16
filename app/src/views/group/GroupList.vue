<template>
  <view-search
    items-name="groups"
    :search.sync="search"
    :items="normalGroups"
    :filtered-items="filteredGroups"
    :queries="queries"
    @queries-response="formatGroups"
    skeleton="card-form-skeleton"
  >
    <template #top-bar-buttons>
      <b-button variant="success" :to="{ name: 'group-create' }">
        <icon iname="plus" /> {{ $t('group_new') }}
      </b-button>
    </template>

    <!-- PRIMARY GROUPS CARDS -->
    <card
      v-for="(group, name) in filteredGroups" :key="name" collapsable
      :title="group.isSpecial ? $t('group_' + name) : `${$t('group')} '${name}'`" icon="group"
    >
      <template #header-buttons>
        <!-- DELETE GROUP -->
        <b-button
          v-if="!group.isSpecial" @click="deleteGroup(name)"
          size="sm" variant="danger"
        >
          <icon iname="trash-o" /> {{ $t('delete') }}
        </b-button>
      </template>

      <b-row>
        <b-col md="3" lg="2">
          <strong>{{ $t('users') }}</strong>
        </b-col>

        <b-col>
          <template v-if="group.isSpecial">
            <p><icon iname="info-circle" /> {{ $t('group_explain_' + name) }}</p>
            <p v-if="name === 'visitors'">
              <em>{{ $t('group_explain_visitors_needed_for_external_client') }}</em>
            </p>
          </template>
          <template v-else>
            <zone-selectize
              :choices="group.availableMembers" :selected="group.members"
              item-icon="user"
              :label="$t('group_add_member')"
              @change="onUserChanged({ ...$event, name })"
            />
          </template>
        </b-col>
      </b-row>
      <hr>

      <b-row>
        <b-col md="3" lg="2">
          <strong>{{ $t('permissions') }}</strong>
        </b-col>
        <b-col>
          <zone-selectize
            item-icon="key-modern" item-variant="dark"
            :choices="group.availablePermissions"
            :selected="group.permissions"
            :label="$t('group_add_permission')"
            :format="formatPermission"
            :removable="name === 'visitors' ? removable : null"
            @change="onPermissionChanged({ ...$event, name, groupType: 'normal' })"
          />
        </b-col>
      </b-row>
    </card>

    <!-- GROUP SPECIFIC CARD -->
    <card
      v-if="userGroups" collapsable
      :title="$t('group_specific_permissions')" icon="group"
    >
      <template v-for="(name, index) in userGroupsNames">
        <b-row :key="name">
          <b-col md="3" lg="2">
            <icon iname="user" /> <strong>{{ name }}</strong>
          </b-col>

          <b-col>
            <zone-selectize
              item-icon="key-modern" item-variant="dark"
              :choices="userGroups[name].availablePermissions"
              :selected="userGroups[name].permissions"
              :label="$t('group_add_permission')"
              :format="formatPermission"
              @change="onPermissionChanged({ ...$event, name, groupType: 'user' })"
            />
          </b-col>
        </b-row>
        <hr :key="index">
      </template>

      <base-selectize
        v-if="availableMembers.length"
        :label="$t('group_add_member')"
        :choices="availableMembers"
        :selected="userGroupsNames"
        @selected="onSpecificUserAdded"
      />
    </card>
  </view-search>
</template>

<script>
import Vue from 'vue'

import api from '@/api'
import { isEmptyValue } from '@/helpers/commons'
import ZoneSelectize from '@/components/ZoneSelectize'
import BaseSelectize from '@/components/BaseSelectize'

// TODO add global search with type (search by: group, user, permission)
// TODO add vuex store update on inputs ?
export default {
  name: 'GroupList',

  data () {
    return {
      queries: [
        { uri: 'users' },
        { uri: 'users/groups?full&include_primary_groups', storeKey: 'groups' },
        { uri: 'users/permissions?full', storeKey: 'permissions' }
      ],
      search: '',
      permissions: undefined,
      normalGroups: undefined,
      userGroups: undefined
    }
  },

  computed: {
    filteredGroups () {
      const groups = this.normalGroups
      if (!groups) return
      const search = this.search.toLowerCase()
      const filtered = {}
      for (const name in groups) {
        if (name.toLowerCase().includes(search)) {
          filtered[name] = groups[name]
        }
      }
      return isEmptyValue(filtered) ? null : filtered
    },

    userGroupsNames () {
      const groups = this.userGroups
      if (!groups) return
      return Object.keys(groups).filter(name => {
        return groups[name].permissions !== null
      })
    },

    availableMembers () {
      const groups = this.userGroups
      if (!groups) return
      return Object.keys(groups).filter(name => {
        return groups[name].permissions === null
      })
    }
  },

  methods: {
    formatGroups (users, allGroups, permissions) {
      // Do not use computed properties to get values from the store here to avoid auto
      // updates while modifying values.
      const normalGroups = {}
      const userGroups = {}
      const userNames = users ? Object.keys(users) : []

      for (const groupName in allGroups) {
        // copy the group to unlink it from the store
        const group = { ...allGroups[groupName] }
        group.availablePermissions = Object.keys(permissions).filter(perm => {
          // Remove 'email', 'xmpp' and protected permissions in visitors's permission choice list
          if (groupName === 'visitors' && (['mail.main', 'xmpp.main'].includes(perm) || permissions[perm].protected)) {
            return false
          }
          return !group.permissions.includes(perm)
        })

        if (userNames.includes(groupName)) {
          if (group.permissions.length === 0) {
            // This forbid the user to appear in the displayed user list
            group.permissions = null
          }
          userGroups[groupName] = group
          continue
        }

        if (['visitors', 'all_users'].includes(groupName)) {
          group.isSpecial = true
        } else {
          group.availableMembers = userNames.filter(name => {
            return !group.members.includes(name)
          })
        }
        normalGroups[groupName] = group
      }

      this.permissions = permissions
      this.normalGroups = normalGroups
      this.userGroups = isEmptyValue(userGroups) ? null : userGroups
    },

    onPermissionChanged ({ item, index, name, groupType, action }) {
      const uri = 'users/permissions/' + item
      const data = { [action]: name }
      const from = action === 'add' ? 'availablePermissions' : 'permissions'
      const to = action === 'add' ? 'permissions' : 'availablePermissions'
      api.put(uri, data).then(() => {
        this[groupType + 'Groups'][name][from].splice(index, 1)
        this[groupType + 'Groups'][name][to].push(item)
      })
    },

    onUserChanged ({ item, index, name, action }) {
      const uri = 'users/groups/' + name
      const data = { [action]: item }
      const from = action === 'add' ? 'availableMembers' : 'members'
      const to = action === 'add' ? 'members' : 'availableMembers'
      api.put(uri, data).then(() => {
        this.normalGroups[name][from].splice(index, 1)
        this.normalGroups[name][to].push(item)
      })
    },

    onSpecificUserAdded ({ item }) {
      this.userGroups[item].permissions = []
    },

    // FIXME Find a way to pass a filter to a component
    formatPermission (name) {
      return this.permissions[name].label
    },

    removable (name) {
      return this.permissions[name].protected === false
    },

    async deleteGroup (name) {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_delete', { name }))
      if (!confirmed) return

      this.$store.dispatch('DELETE',
        { uri: 'users/groups', param: name, storeKey: 'groups' }
      ).then(() => {
        Vue.delete(this.normalGroups, name)
      })
    }
  },

  components: {
    ZoneSelectize,
    BaseSelectize
  }
}
</script>

<style lang="scss" scoped>
.row > div:first-child {
  margin-bottom: 1rem;
}
</style>
