<template>
  <view-base :queries="queries" skeleton="card-info-skeleton">
    <card v-if="user" :title="user.fullname" icon="user">
      <div class="d-flex align-items-center flex-column flex-md-row">
        <icon iname="user" class="fa-fw" />

        <div class="w-100">
          <b-row>
            <b-col><strong>{{ $t('user_username') }}</strong></b-col>
            <b-col>{{ user.username }}</b-col>
          </b-row>

          <b-row>
            <b-col><strong>{{ $t('user_email') }}</strong></b-col>
            <b-col class="font-italic">
              {{ user.mail }}
            </b-col>
          </b-row>

          <b-row>
            <b-col><strong>{{ $t('user_mailbox_quota') }}</strong></b-col>
            <b-col>{{ user['mailbox-quota'].limit }}</b-col>
          </b-row>

          <b-row>
            <b-col><strong>{{ $t('user_mailbox_use') }}</strong></b-col>
            <b-col>{{ user['mailbox-quota'].use }}</b-col>
          </b-row>

          <b-row v-for="(trad, mailType) in {'mail-aliases': 'user_emailaliases', 'mail-forward': 'user_emailforward'}" :key="mailType">
            <b-col><strong>{{ $t(trad) }}</strong></b-col>

            <b-col v-if="user[mailType]">
              <ul v-if="user[mailType].length > 1">
                <li v-for="(alias, index) in user[mailType]" :key="index">
                  {{ alias }}
                </li>
              </ul>

              <template v-else-if="user[mailType][0]">
                {{ user[mailType][0] }}
              </template>
            </b-col>
          </b-row>
        </div>
      </div>

      <template #buttons>
        <b-button :to="{ name: 'user-edit', params: { user } }" :variant="user ? 'info' : 'dark'">
          <icon iname="edit" />
          {{ user ? $t('user_username_edit', {name: user.username}) : '' }}
        </b-button>

        <b-button v-b-modal.delete-modal :variant="user ? 'danger' : 'dark'">
          <icon iname="trash-o" />
          {{ user ? $t('delete') : '' }}
        </b-button>
      </template>
    </card>

    <b-modal
      v-if="user"
      id="delete-modal" :title="$t('confirm_delete', { name: user.username })" @ok="deleteUser"
      header-bg-variant="warning" body-class="" body-bg-variant=""
    >
      <b-form-group>
        <b-form-checkbox v-model="purge">
          {{ $t('purge_user_data_checkbox', { name: user.username }) }}
        </b-form-checkbox>

        <template #description>
          <div class="alert alert-warning">
            <icon iname="exclamation-triangle" /> {{ $t('purge_user_data_warning') }}
          </div>
        </template>
      </b-form-group>
    </b-modal>
  </view-base>
</template>

<script>

export default {
  name: 'UserInfo',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [{ uri: 'users', param: this.name, storeKey: 'users_details' }],
      purge: false
    }
  },

  computed: {
    user () {
      return this.$store.getters.user(this.name)
    }
  },

  methods: {
    deleteUser () {
      const data = this.purge ? { purge: '' } : {}
      this.$store.dispatch('DELETE',
        { uri: 'users', param: this.name, data, storeKey: 'users_details' }
      ).then(() => {
        this.$router.push({ name: 'user-list' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.icon.fa-user {
  font-size: 10rem;
  padding-right: 3rem;
  padding-left: 1.75rem;
}

.row {
  + .row {
      border-top: 1px solid #eee;
  }

  padding: .5rem;
}

.col {
  margin: 0;
}

ul {
  margin: 0;
  padding: 0;

  li {
    font-style: italic;
    list-style: none;
  }
}
</style>
