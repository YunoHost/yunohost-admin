<template>
    <span v-bind:class="'icon fa fa-' + iname" aria-hidden="true"></span>
</template>

<script>
export default {
    name: 'icon',
    props: {
        iname: String,
    }
}
</script>

<style lang="scss" scoped>
.icon {
    font-size: 1.5rem;
    width: 3rem;

    &.sm {
        width: 1rem;
        font-size: 1rem;
    }

    &.fs-sm {
        font-size: 1rem;
    }
}
</style>
