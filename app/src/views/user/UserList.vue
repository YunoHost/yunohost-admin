<template>
  <view-search
    :search.sync="search"
    :items="users"
    :filtered-items="filteredUsers"
    items-name="users"
    :queries="queries"
  >
    <template #top-bar-buttons>
      <b-button variant="info" :to="{ name: 'group-list' }">
        <icon iname="key-modern" /> {{ $t('groups_and_permissions_manage') }}
      </b-button>

      <b-dropdown
        :split-to="{ name: 'user-create' }"
        split variant="outline-success" right
        split-variant="success"
      >
        <template #button-content>
          <icon iname="plus" /> {{ $t('users_new') }}
        </template>
        <b-dropdown-item :to="{ name: 'user-import' }">
          <icon iname="plus" /> {{ $t('users_import') }}
        </b-dropdown-item>
        <b-dropdown-item @click="downloadExport">
          <icon iname="download" /> {{ $t('users_export') }}
        </b-dropdown-item>
      </b-dropdown>
    </template>

    <b-list-group>
      <b-list-group-item
        v-for="user in filteredUsers" :key="user.username"
        :to="{ name: 'user-info', params: { name: user.username }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ user.username }}
            <small class="text-secondary">{{ user.fullname }}</small>
          </h5>
          <p class="m-0">
            {{ user.mail }}
          </p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </view-search>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserList',

  data () {
    return {
      queries: [
        ['GET', { uri: 'users?fields=username&fields=fullname&fields=mail&fields=mailbox-quota&fields=groups' }]
      ],
      search: ''
    }
  },
  methods: {
    downloadExport () {
      const host = this.$store.getters.host
      window.open(`https://${host}/yunohost/api/users/export`, '_blank')
    }
  },
  computed: {
    ...mapGetters(['users']),

    filteredUsers () {
      if (!this.users) return
      const search = this.search.toLowerCase()
      const filtered = this.users.filter(user => {
        return user.username.toLowerCase().includes(search) || user.groups.includes(search)
      })
      return filtered.length === 0 ? null : filtered
    }
  }
}
</script>
