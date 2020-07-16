<template>
  <div class="user">
    <breadcrumb />
    <b-card :class="{skeleton: !user}">
      <template v-slot:header>
        <h2>{{ user ? user.fullname : '' }}</h2>
      </template>
      <div class="d-flex align-items-center">
        <icon iname="user" class="fa-fw" />
        <div class="w-100">
          <template v-if="user">
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
              <b-col>
                <ul v-if="user[mailType] && user[mailType].length > 1">
                  <li v-for="(alias, index) in user[mailType]" :key="index">
                    {{ alias }}
                  </li>
                </ul>
                <template v-else-if="user[mailType][0]">
                  {{ user[mailType][0] }}
                </template>
              </b-col>
            </b-row>
          </template>
          <!-- skeleton -->
          <template v-else>
            <b-row v-for="(n, index) in 6" :key="index">
              <b-col>
                <strong class="rounded" />
              </b-col>
              <b-col>
                <span v-if="n <= 4" class="rounded" />
              </b-col>
            </b-row>
          </template>
        </div>
      </div>
      <template v-slot:footer>
        <div class="d-flex d-flex justify-content-end">
          <b-button :to="user ? {name: 'user-edit', params: {user: user}} : null"
                    :variant="user ? 'info' : 'dark'"
          >
            {{ user ? $t('user_username_edit', {name: user.username}) : '' }}
          </b-button>
          <b-button :variant="user ? 'danger' : 'dark'" class="ml-2">
            {{ user ? $t('delete') : '' }}
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
import api from '@/helpers/api'

export default {
  name: 'User',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      user: undefined
    }
  },
  async created () {
    const data = await api.get('users/' + this.name)
    if (!data) return
    this.user = data
  }
}
</script>

<style lang="scss" scoped>
.card-body > div {
  flex-direction: column;
  @include media-breakpoint-up(md) {
      flex-direction: row;
  }
}

h2 {
  margin: 0;
}

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

.skeleton {
  opacity: 0.5;

  h2 {
    height: #{2 * 1.2}rem;
  }

  .col {
    & > * {
      display: block;
      background-color: $skeleton-color;
      height: 1.5rem;
      max-width: 8rem;
    }

    strong {
      max-width: 12rem;
    }
  }

  button {
    height: calc(2.25rem + 2px);
    width: 7rem;
  }
}
</style>
