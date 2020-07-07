<template>
    <b-list-group-item v-bind:href="uri">
        <span v-bind:class="'fa fa-fw fa-' + icon" aria-hidden="true"></span>
        <h2><slot></slot></h2>
        <span class="fa fa-fw fa-chevron-right ml-auto"></span>
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

<style lang="scss">
    .list-group-item {
        padding: 0;
        display: flex;
        align-items: center;
    }
    .list-group-item-action {
        color: #333;
    }
    h2 {
        font-size: 1.25rem;
        font-weight: 400;
        margin: 0;
    }
    span.fa {
        font-size: 1.5rem;
        width: 3rem;
        line-height: 3rem;

        &.fa-chevron-right {
            font-size: 1rem;
        }
    }
</style>
