<template>
  <div class="backup">
    <b-list-group>
      <b-list-group-item
        v-for="{ id, name, uri } in storages" :key="id"
        :to="{ name: 'backup-list', params: { id }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5>
            {{ name }}
            <small>{{ id }}</small>
          </h5>
          <p class="mb-0">{{ uri }}</p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'Backup',

  data () {
    return {
      storages: [
        {
          id: 'local',
          name: this.$i18n.t('local_archives'),
          uri: '/home/yunohost.backup/'
        }
      ]
    }
  }
}
</script>
