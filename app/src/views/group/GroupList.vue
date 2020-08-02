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
    <template v-if="primaryGroups">
      <b-card
        v-for="(group, name, index) in filteredPrimaryGroups" :key="name"
        no-body
      >
        <b-card-header class="d-flex align-items-center">
          <h2>
            <icon iname="group" />{{ group.isSpecial ? $t('group_' + name) : `${$t('group')} "${name}"` }}
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
                    item-icon="user" search-icon="user-plus" item-route="user-info"
                    :aria-label="$t('group_add_member')"
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
                  item-icon="key-modern" item-variant="info"
                  :choices="group.availablePermissions"
                  :selected="group.permissions"
                  :aria-label="$t('group_add_permission')"
                  :format="formatPermission"
                  @change="onPermissionChanged({ ...$event, name, groupType: 'primary' })"
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
                  :aria-label="$t('group_add_permission')"
                  :format="formatPermission"
                  @change="onPermissionChanged({ ...$event, name, groupType: 'user' })"
                />
              </b-col>
            </b-row>
            <hr>
          </div>

          <base-selectize
            search-icon="user-plus"
            :aria-label="$t('group_add_member')"
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
    primaryGroups: undefined,
    userGroups: undefined,
    groupToDelete: undefined
  }),

  computed: {
    filteredPrimaryGroups () {
      const groups = this.primaryGroups
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
        this.primaryGroups[name][from].splice(index, 1)
        this.primaryGroups[name][to].push(item)
      })
    },

    onSpecificUserAdded ({ item }) {
      this.userGroups[item].permissions = []
    },

    // FIXME Find a way to pass a filter to a component
    formatPermission: text => {
      let result = text.replace('.main', '')
      if (result.includes('.')) {
        result = result.replace('.', ' (') + ')'
      }
      if (result === 'mail') return 'E-mail'
      else if (result === 'xmpp') return 'XMPP'
      else {
        return result.replace(/\w\S*/g, txt => {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        })
      }
    },

    deleteGroup () {
      const groupname = this.groupToDelete
      this.$store.dispatch('DELETE',
        { uri: 'users/groups', param: groupname, storeKey: 'groups' }
      ).then(() => {
        Vue.delete(this.primaryGroups, groupname)
      })
      this.groupToDelete = undefined
    }
  },

  created () {
    this.$store.dispatch('FETCH_ALL', [
      { uri: 'users' },
      { uri: 'users/groups?full&include_primary_groups', storeKey: 'groups' },
      { uri: 'users/permissions?short', storeKey: 'permissions' }
    ]).then(([users, groups, permissions]) => {
      // Do not use computed properties to get values from the store here to avoid auto
      // updates while modifying values.

      // pre-format the stored data for rendering
      const primaryGroups = {}
      const userGroups = {}

      const userNames = Object.keys(users)
      for (const groupName in groups) {
        // copy the group to unlink it from the store
        const group = { ...groups[groupName] }
        group.availablePermissions = permissions.filter(perm => {
          // Remove 'email' and 'xmpp' in visitors's permission choice list
          if (groupName === 'visitors' && ['mail.main', 'xmpp.main'].includes(perm)) {
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
        primaryGroups[groupName] = group
      }

      this.primaryGroups = primaryGroups
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
.card + .card {
  margin-top: 2rem;
}
.card-header {
  h2 .icon {
    font-size: 1.5rem;
    width: 1.5rem;
    margin-right: 1.25rem;
  }
}

// collapse icon
.not-collapsed .icon {
  transform: rotate(-90deg);
}
.collapsed .icon {
  transform: rotate(90deg);
  position: relative;
  top: 2px;
}

.row > div:first-child {
  margin-bottom: 1rem;
}

// delete modal
#delete-modal .modal-body {
  display: none;
}
</style>
