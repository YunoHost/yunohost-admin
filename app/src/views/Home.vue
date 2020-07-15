<template>
  <div class="home">
    <b-list-group>
      <b-list-group-item v-for="item in menu" :key="item.id" :to="item.uri">
        <icon :iname="item.icon" class="lg" />
        <h2>{{ $t(item.translation) }}</h2>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data: () => {
    return {
      menu: [
        { id: 0, uri: '/users', icon: 'users', translation: 'users' },
        { id: 1, uri: '/domains', icon: 'globe', translation: 'domains' },
        { id: 2, uri: '/apps', icon: 'cubes', translation: 'applications' },
        { id: 3, uri: '/update', icon: 'refresh', translation: 'system_update' },
        { id: 4, uri: '/services', icon: 'cog', translation: 'services' },
        { id: 5, uri: '/tools', icon: 'wrench', translation: 'tools' },
        { id: 6, uri: '/diagnosis', icon: 'stethoscope', translation: 'diagnosis' },
        { id: 7, uri: '/backup', icon: 'archive', translation: 'backup' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.list-group-item {
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
}

h2 {
    font-size: 1.25rem;
    font-weight: 400;
    margin: 0;
}
</style>
