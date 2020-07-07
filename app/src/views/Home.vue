<template>
    <div class="home">
        <b-list-group>
            <list-group-item
                v-for="item in menu"
                v-bind:key="item.id"
                v-bind:uri="item.uri"
                v-bind:icon="item.icon"
            >{{ $t(item.translation) }}</list-group-item>
        </b-list-group>
    </div>
</template>

<script>
import ListGroupItem from '@/components/ListGroupItem'

export default {
    name: 'Home',
    data: () => {
        return {
            menu: [
                {id: 0, uri: '/users', icon: 'users', translation: 'users'},
                {id: 1, uri: '/domains', icon: 'globe', translation: 'domains'},
                {id: 2, uri: '/apps', icon: 'cubes', translation: 'applications'},
                {id: 3, uri: '/update', icon: 'refresh', translation: 'system_update'},
                {id: 4, uri: '/services', icon: 'cog', translation: 'services'},
                {id: 5, uri: '/tools', icon: 'wrench', translation: 'tools'},
                {id: 6, uri: '/diagnosis', icon: 'stethoscope', translation: 'diagnosis'},
                {id: 7, uri: '/backup', icon: 'archive', translation: 'backup'},
            ]
        }
    },
    components: {
        ListGroupItem
    }
}
</script>
