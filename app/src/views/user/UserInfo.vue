<template>
  <ViewBase :queries="queries" skeleton="CardInfoSkeleton">
    <YCard v-if="user" :title="user.fullname" icon="user">
      <div class="d-flex align-items-center flex-column flex-md-row">
        <YIcon iname="user" class="fa-fw" />

        <div class="w-100">
          <BRow>
            <BCol><strong>{{ $t('user_username') }}</strong></BCol>
            <BCol>{{ user.username }}</BCol>
          </BRow>

          <BRow>
            <BCol><strong>{{ $t('user_email') }}</strong></BCol>
            <BCol class="font-italic">
              {{ user.mail }}
            </BCol>
          </BRow>

          <BRow>
            <BCol><strong>{{ $t('user_mailbox_quota') }}</strong></BCol>
            <BCol>{{ user['mailbox-quota'].limit }}</BCol>
          </BRow>

          <BRow>
            <BCol><strong>{{ $t('user_mailbox_use') }}</strong></BCol>
            <BCol>{{ user['mailbox-quota'].use }}</BCol>
          </BRow>

          <BRow v-for="(trad, mailType) in {'mail-aliases': 'user_emailaliases', 'mail-forward': 'user_emailforward'}" :key="mailType">
            <BCol><strong>{{ $t(trad) }}</strong></BCol>

            <BCol v-if="user[mailType]">
              <ul v-if="user[mailType].length > 1">
                <li v-for="(alias, index) in user[mailType]" :key="index">
                  {{ alias }}
                </li>
              </ul>

              <template v-else-if="user[mailType][0]">
                {{ user[mailType][0] }}
              </template>
            </BCol>
          </BRow>
        </div>
      </div>

      <template #buttons>
        <BButton :to="{ name: 'user-edit', params: { user } }" :variant="user ? 'info' : 'dark'">
          <YIcon iname="edit" />
          {{ user ? $t('user_username_edit', {name: user.username}) : '' }}
        </BButton>

        <BButton v-b-modal.delete-modal :variant="user ? 'danger' : 'dark'">
          <YIcon iname="trash-o" />
          {{ user ? $t('delete') : '' }}
        </BButton>
      </template>
    </YCard>

    <BModal
      v-if="user"
      id="delete-modal" :title="$t('confirm_delete', { name: user.username })" @ok="deleteUser"
      header-bg-variant="warning" body-class="" body-bg-variant=""
    >
      <BFormGroup>
        <BFormCheckbox v-model="purge">
          {{ $t('purge_user_data_checkbox', { name: user.username }) }}
        </BFormCheckbox>

        <template #description>
          <div class="alert alert-warning">
            <YIcon iname="exclamation-triangle" /> {{ $t('purge_user_data_warning') }}
          </div>
        </template>
      </BFormGroup>
    </BModal>
  </ViewBase>
</template>

<script>
import api from '@/api'

export default {
  name: 'UserInfo',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', { uri: 'users', param: this.name, storeKey: 'users_details' }]
      ],
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
      api.delete(
        { uri: 'users', param: this.name, storeKey: 'users_details' },
        data,
        { key: 'users.delete', name: this.name }
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
      border-top: $thin-border;
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
