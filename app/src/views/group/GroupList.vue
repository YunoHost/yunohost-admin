<template lang="html">
  <div class="group-list">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <label class="sr-only" for="search-group">Search group</label>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-group" v-model="search" placeholder="Search group" />
      </b-input-group>
      <div class="buttons">
        <b-button variant="success" :to="{name: 'group-create'}">
          <icon iname="plus" /> {{ $t('group_new') }}
        </b-button>
      </div>
    </div>

    <!-- PRIMARY GROUPS CARDS -->
    <template v-if="groups">
      <b-card
        v-for="(group, name, index) in primaryGroups" :key="index"
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
                  <selectize-zone
                    :choices="group.membersInv" :selected="group.members"
                    item-icon="user" search-icon="user-plus" item-route="user-info"
                    :aria-label="$t('group_add_member')"
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
                <selectize-zone
                  :choices="group.permissionsInv" :selected="group.permissions"
                  item-icon="key-modern" item-variant="info"
                  :aria-label="$t('group_add_permission')"
                />
              </b-col>
            </b-row>
          </b-card-body>
        </b-collapse>
      </b-card>
    </template>
  </div>
</template>

<script>
import SelectizeZone from '@/components/SelectizeZone'

// TODO add global search with type (search by: group, user, permission)
export default {
  name: 'GroupList',

  data: () => ({
    search: ''
  }),

  computed: {
    users () {
      const users = this.$store.state.data.users
      return users ? Object.values(users) : users
    },

    groups () {
      const users = this.$store.state.data.users
      const groups = this.$store.state.data.groups
      const perms = this.$store.state.data.permissions
      if (!users || !groups || !perms) return
      const userNames = Object.keys(users)

      for (const groupName in groups) {
        groups[groupName].isPrimary = !userNames.includes(groupName)
        groups[groupName].permissionsInv = perms.filter(perm => {
          // Remove 'email' and 'xmpp' in visitors's permission choice list
          if (groupName === 'visitors' && ['mail.main', 'xmpp.main'].includes(perm)) {
            return false
          }
          return !groups[groupName].permissions.includes(perm)
        })
        groups[groupName].membersInv = userNames.filter(name => {
          return !groups[groupName].members.includes(name)
        })
      }
      groups.visitors.isSpecial = true
      groups.all_users.isSpecial = true

      return groups
    },

    permissions () {
      return this.$store.state.data.permissions
    },

    primaryGroups () {
      const groups = this.groups
      if (!groups) return
      const search = this.search.toLowerCase()
      const primaryGroups = {}
      for (const [groupName, group] of Object.entries(groups)) {
        if (group.isPrimary && groupName.toLowerCase().includes(search)) {
          primaryGroups[groupName] = group
        }
      }
      return primaryGroups
    }
  },

  created () {
    this.$store.dispatch('FETCH_ALL', [
      { uri: 'users' },
      { uri: 'users/groups?full&include_primary_groups', storeKey: 'groups' },
      { uri: 'users/permissions?short', storeKey: 'permissions' }
    ])
  },

  components: {
    SelectizeZone
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
</style>
