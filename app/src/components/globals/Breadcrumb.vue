<template>
  <b-breadcrumb>
    <b-breadcrumb-item to="/">
      <span class="sr-only">{{ $t('home') }}</span>
      <icon iname="home" />
    </b-breadcrumb-item>
    <b-breadcrumb-item
      v-for="(route, index) in breadcrumb"
      :key="index"
      :to="{name: route.name}"
      :active="index == lastIndex ? true : false"
    >
      {{ route.text }}
    </b-breadcrumb-item>
  </b-breadcrumb>
</template>

<script>
export default {
  name: 'Breadcrumb',
  computed: {
    params: function () {
      return this.$route.params
    },
    breadcrumb: function () {
      return this.$route.meta.breadcrumb.map(({ name, trad, param }) => {
        let text = ''
        // if a traduction key string has been given and we also need to pass
        // the route param as a variable.
        if (trad && param) {
          text = this.$i18n.t(trad, { [param]: this.params[param] })
        } else if (trad) {
          text = this.$i18n.t(trad)
        } else {
          text = this.params[param]
        }
        return { name, text }
      })
    },
    lastIndex: function () {
      return this.breadcrumb.length - 1
    }
  }
}
</script>

<style lang="scss" scoped>
.breadcrumb {
  border: none;
  background-color: transparent !important;
}
</style>
