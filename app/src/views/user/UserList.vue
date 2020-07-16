<template>
  <div class="users">
    <breadcrumb />

    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <label class="sr-only" for="search-user">{{ $t('user.search') }}</label>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-user" v-model="search" :placeholder="$t('user.search')" />
      </b-input-group>
      <div class="buttons">
        <b-button variant="info">
          <icon iname="key-modern" />
          {{ $t('groups_and_permissions_manage') }}
        </b-button>
        <b-button variant="success" :to="{name: 'user-create'}">
          <icon iname="plus" />
          {{ $t('users_new') }}
        </b-button>
      </div>
    </div>

    <template v-if="users === null">
      <b-alert variant="warning" show>
        <icon iname="exclamation-triangle" class="fa-fw mr-1" />
        {{ $t('users_no') }}
      </b-alert>
    </template>

    <template v-else>
      <b-list-group :class="{skeleton: !users}">
        <b-list-group-item
          v-for="(user, index) in (users ? filteredUser : 3)"
          :key="index"
          :to="users ? { name: 'user-info', params: { name: user.username }} : null"
          class="d-flex justify-content-between align-items-center pr-0"
        >
          <div>
            <h5 :class="{rounded: !users}">
              {{ user.username }}
              <small>({{ user.fullname }})</small>
            </h5>
            <p :class="{rounded: !users}">
              {{ user.mail }}
            </p>
          </div>
          <icon iname="chevron-right" class="lg fs-sm ml-auto" />
        </b-list-group-item>
      </b-list-group>
    </template>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data: function () {
    return {
      search: ''
    }
  },
  computed: {
    users () {
      return this.$store.state.data.users
    },
    filteredUser () {
      const search = this.search.toLowerCase()
      return this.users.filter(user => {
        return user.username.toLowerCase().includes(search)
      })
    }
  },
  async created () {
    this.$store.dispatch('FETCH', { uri: 'users' })
  }
}
</script>

<style lang="scss" scoped>
p {
  margin: 0
}

.actions {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;

  @include media-breakpoint-down(xs) {
    .buttons {
      flex-direction: column;
      justify-content: space-between;
    }
  }

  @include media-breakpoint-down(sm) {
    flex-direction: column-reverse;
    margin-bottom: 2rem;

    .buttons {
      display: flex;
      justify-content: space-between;

      .btn {
        margin-bottom: .5rem;
      }
    }
  }

  @include media-breakpoint-up(md) {
    .btn-success {
      margin-left: .5rem;
    }
  }

  .input-group {
    @include media-breakpoint-up(md) {
      width: 25%;
    }
    @include media-breakpoint-up(lg) {
      width: 35%;
    }
  }
}

.skeleton {
  @each $i, $opacity in 1 .75, 2 .5, 3 .25 {
    .list-group-item:nth-child(#{$i}) { opacity: $opacity; }
  }

  h5, p {
    background-color: $skeleton-color;
    height: 1.5rem;
    width: 10rem;
  }

  small {
    display: none;
  }
}
</style>
