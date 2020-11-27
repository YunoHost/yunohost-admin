<template lang="html">
  <div class="group-list">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-group" v-model="search" :placeholder="$t('search.group')" />
      </b-input-group>
      <div class="buttons">
        <b-button variant="success" :to="{name: 'group-create'}">
          <icon iname="plus" /> {{ $t('group_new') }}
        </b-button>
      </div>
    </div>

    <!-- PRIMARY GROUPS CARDS -->
    <template v-if="normalGroups">
      <b-card
        v-for="(group, name, index) in filteredGroups" :key="name"
        no-body
      >
        <b-card-header class="d-flex align-items-center">
          <h2>
            <icon iname="group" /> {{ group.isSpecial ? $t('group_' + name) : `${$t('group')} "${name}"` }}
          </h2>

          <div class="ml-auto">
            <b-button v-b-toggle="'collapse-' + index" size="sm" variant="outline-secondary">
              <icon iname="chevron-right" class="rotate" /><span class="sr-only">{{ $t('words.collapse') }}</span>
            </b-button>

            <b-button
              v-if="!group.isSpecial" v-b-modal.delete-modal
              variant="danger" class="ml-2" size="sm"
              @click="groupToDelete = name"
            >
              <icon :title="$t('delete')" iname="trash-o" /> <span class="sr-only">{{ $t('delete') }}</span>
            </b-button>
          </div>
        </b-card-header>

        <b-collapse :id="'collapse-' + index" visible>
          <b-card-body>
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
                    item-icon="user" item-route="user-info"
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
          </b-card-body>
        </b-collapse>
      </b-card>
    </template>

    <!-- GROUP SPECIFIC CARD -->
    <b-card no-body v-if="userGroups">
      <b-card-header class="d-flex align-items-center">
        <h2>
          <icon iname="group" /> {{ $t('group_specific_permissions') }}
        </h2>

        <div class="ml-auto">
          <b-button v-b-toggle.collapse-specific size="sm" variant="outline-secondary">
            <icon iname="chevron-right" class="rotate" /><span class="sr-only">{{ $t('words.collapse') }}</span>
          </b-button>
        </div>
      </b-card-header>

      <b-collapse id="collapse-specific" visible>
        <b-card-body>
          <div v-for="name in userGroupsNames" :key="name">
            <b-row>
              <b-col md="3" lg="2">
                <icon iname="user" /> <strong>{{ name }}</strong>
              </b-col>

              <b-col>
                <zone-selectize
                  item-icon="key-modern" item-variant="info"
                  :choices="userGroups[name].availablePermissions"
                  :selected="userGroups[name].permissions"
                  :label="$t('group_add_permission')"
                  :format="formatPermission"
                  @change="onPermissionChanged({ ...$event, name, groupType: 'user' })"
                />
              </b-col>
            </b-row>
            <hr>
          </div>

          <base-selectize
            v-if="availableMembers.length"
            :label="$t('group_add_member')"
            :choices="availableMembers"
            :selected="userGroupsNames"
            @selected="onSpecificUserAdded"
          />
        </b-card-body>
      </b-collapse>
    </b-card>

    <!-- DELETE GROUP MODAL -->
    <b-modal
      v-if="groupToDelete" id="delete-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="deleteGroup" hide-header
    >
      {{ $t('confirm_delete', {name: groupToDelete }) }}
    </b-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import ZoneSelectize from '@/components/ZoneSelectize'
import BaseSelectize from '@/components/BaseSelectize'

// TODO add global search with type (search by: group, user, permission)
// TODO add vuex store update on inputs
export default {
  name: 'GroupList',

  data: () => ({
    search: '',
    permissions: undefined,
    normalGroups: undefined,
    userGroups: undefined,
    groupToDelete: undefined
  }),

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
      return filtered
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
    onPermissionChanged ({ item, index, name, groupType, action }) {
      const uri = 'users/permissions/' + item
      const data = { [action]: name }
      const from = action === 'add' ? 'availablePermissions' : 'permissions'
      const to = action === 'add' ? 'permissions' : 'availablePermissions'
      this.$store.dispatch('PUT', { uri, data }).then(() => {
        this[groupType + 'Groups'][name][from].splice(index, 1)
        this[groupType + 'Groups'][name][to].push(item)
      })
    },

    onUserChanged ({ item, index, name, action }) {
      const uri = 'users/groups/' + name
      const data = { [action]: item }
      const from = action === 'add' ? 'availableMembers' : 'members'
      const to = action === 'add' ? 'members' : 'availableMembers'
      this.$store.dispatch('PUT', { uri, data }).then(() => {
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

    deleteGroup () {
      const groupname = this.groupToDelete
      this.$store.dispatch('DELETE',
        { uri: 'users/groups', param: groupname, storeKey: 'groups' }
      ).then(() => {
        Vue.delete(this.groups, groupname)
      })
      this.groupToDelete = undefined
    }
  },

  created () {
    this.$store.dispatch('FETCH_ALL', [
      { uri: 'users' },
      { uri: 'users/groups?full&include_primary_groups', storeKey: 'groups' },
      { uri: 'users/permissions?full', storeKey: 'permissions' }
    ]).then(([users, allGroups, permissions]) => {
      // Do not use computed properties to get values from the store here to avoid auto
      // updates while modifying values.
      const normalGroups = {}
      const userGroups = {}
      const userNames = Object.keys(users)

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
      this.userGroups = userGroups
    })
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
