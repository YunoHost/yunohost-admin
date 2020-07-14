<template>
    <b-breadcrumb>
        <b-breadcrumb-item to="/">
            <span class="sr-only">{{ $t('home') }}</span>
            <icon iname="home"/>
        </b-breadcrumb-item>
        <b-breadcrumb-item
            v-for="(route, index) in breadcrumb"
            :key="index"
            :to="{name: route.name}"
            :active="index == lastIndex ? true : false"
            >{{ route.trad ? $t(route.trad) : params[route.param] }}</b-breadcrumb-item>
    </b-breadcrumb>
</template>

<script>
export default {
    computed: {
        params: function () {
            return this.$route.params
        },
        breadcrumb: function () {
            return this.$route.meta.breadcrumb
        },
        lastIndex: function () {
            return this.breadcrumb.length - 1
        },
    },
}
</script>

<style lang="scss" scoped>
.breadcrumb {
    border: none;
    background-color: transparent;
}
</style>
