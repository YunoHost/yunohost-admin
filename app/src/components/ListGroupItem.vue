<template>
    <b-list-group-item v-bind:to="uri">
        <icon v-bind:iname="icon" class="fa-fw"/>
        <h2><slot></slot></h2>
        <icon iname="chevron-right" class="fa-fw fs-sm ml-auto"/>
    </b-list-group-item>
</template>

<script>
export default {
    props: {
        uri: String,
        icon: String,
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
