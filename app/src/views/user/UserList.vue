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
        <icon iname="key-modern" />
        {{ $t('groups_and_permissions_manage') }}
      </b-button>

      <b-button variant="success" :to="{ name: 'user-create' }">
        <icon iname="plus" />
        {{ $t('users_new') }}
      </b-button>
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
            <small class="text-secondary">({{ user.fullname }})</small>
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
      queries: [{ uri: 'users' }],
      search: ''
    }
  },

  computed: {
    ...mapGetters(['users']),

    filteredUsers () {
      if (!this.users) return
      const search = this.search.toLowerCase()
      const filtered = this.users.filter(user => {
        return user.username.toLowerCase().includes(search)
      })
      return filtered.length === 0 ? null : filtered
    }
  }
}
</script>
