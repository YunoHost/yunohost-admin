<template>
  <div>
    <BListGroup>
      <BListGroupItem
        v-for="{ id, name, uri } in storages"
        :key="id"
        :to="{ name: 'backup-list', params: { id } }"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ name }}
            <small class="text-secondary">{{ id }}</small>
          </h5>
          <p class="m-0">
            {{ uri }}
          </p>
        </div>
        <YIcon iname="chevron-right" class="lg fs-sm ml-auto" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>

<script>
export default {
  name: 'BackupView',

  data() {
    return {
      storages: [
        {
          id: 'local',
          name: this.$t('local_archives'),
          uri: '/home/yunohost.backup/',
        },
      ],
    }
  },
}
</script>
