<template>
  <b-breadcrumb v-if="routesList">
    <b-breadcrumb-item to="/">
      <span class="sr-only">{{ $t('home') }}</span>
      <icon iname="home" />
    </b-breadcrumb-item>

    <b-breadcrumb-item
      v-for="{ name, text } in breadcrumb" :key="name"
      :to="{ name }" :active="name === $route.name"
    >
      {{ text }}
    </b-breadcrumb-item>
  </b-breadcrumb>
</template>

<script>
export default {
  name: 'Breadcrumb',

  computed: {
    routesList () {
      const routesList = this.$route.meta.breadcrumb
      return routesList && routesList.length ? routesList : null
    },

    breadcrumb () {
      if (!this.routesList) return
      // Get current params to pass it to potential previous routes
      const currentParams = this.$route.params
      return this.routesList.map(name => {
        const { trad, param } = this.getRouteArgs(name)
        let text = ''
        // if a traduction key string has been given and we also need to pass
        // the route param as a variable.
        if (trad && param) {
          text = this.$i18n.t(trad, { [param]: currentParams[param] })
        } else if (trad) {
          text = this.$i18n.t(trad)
        } else {
          text = currentParams[param]
        }
        return { name, text }
      })
    }
  },

  methods: {
    getRouteArgs (routeName) {
      const route = this.$router.options.routes.find(route => route.name === routeName)
      return route ? route.meta.args : {}
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent;
}
</style>
