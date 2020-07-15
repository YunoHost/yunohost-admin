<template>
  <div class="users">
    <breadcrumb />
    <template v-if="users === null">
      <b-alert variant="warning" show>
        <icon iname="exclamation-triangle" class="fa-fw mr-1" />
        {{ $t('users_no') }}
      </b-alert>
    </template>
    <template v-else>
      <b-list-group :class="{skeleton: !users}">
        <b-list-group-item
          v-for="(user, index) in (users ? users : 3)"
          :key="index"
          :to="users ? { name: 'user', params: { name: user.username }} : null"
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
import api from '@/helpers/api'
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'Users',
  data: function () {
    return {
      users: undefined
    }
  },
  computed: {
  },
  async created () {
    const data = await api.get('users')
    if (!data || Object.keys(data.users).length === 0) {
      this.users = null
    } else {
      this.users = data.users
    }
  },
  components: {
    Breadcrumb
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

p {
  margin: 0
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
