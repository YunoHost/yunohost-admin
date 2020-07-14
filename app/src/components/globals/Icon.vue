<template>
    <span :class="'icon fa fa-' + iname" aria-hidden="true"></span>
</template>

<script>
export default {
    name: 'icon',
    props: ['iname'],
}
</script>

<style lang="scss" scoped>
.icon {
    font-size: 1rem;
    width: 1rem;
    text-align: center;

    &.lg {
        width: 3rem;
        font-size: 1.5rem;
    }

    &.fs-sm {
        font-size: 1rem;
    }
}
</style>
