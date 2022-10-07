<template>
  <div class="home">
    <b-list-group class="menu-list">
      <b-list-group-item
        v-for="item in menu"
        :key="item.routeName"
        :to="{ name: item.routeName }"
      >
        <icon :iname="item.icon" class="lg ml-1" />
        <h4>{{ $t(item.translation) }}</h4>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'Home',

  data () {
    return {
      menu: [
        { routeName: 'user-list', icon: 'users', translation: 'users' },
        { routeName: 'domain-list', icon: 'globe', translation: 'domains' },
        { routeName: 'app-list', icon: 'cubes', translation: 'applications' },
        { routeName: 'update', icon: 'refresh', translation: 'system_update' },
        { routeName: 'tool-list', icon: 'wrench', translation: 'tools' },
        { routeName: 'diagnosis', icon: 'stethoscope', translation: 'diagnosis' },
        { routeName: 'backup', icon: 'archive', translation: 'backup' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  margin-top: 2rem;
}
</style>
