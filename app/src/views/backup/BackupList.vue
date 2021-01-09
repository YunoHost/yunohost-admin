<template>
  <view-base :queries="queries" @queries-response="formatBackupList" skeleton="list-group-skeleton">
    <template #top>
      <top-bar :button="{ text: $t('backup_new'), icon: 'plus', to: { name: 'backup-create' } }" />
    </template>

    <b-alert v-if="!archives" variant="warning">
      <icon iname="exclamation-triangle" />
      {{ $t('items_verbose_count', { items: $tc('items.backups', 0) }) }}
    </b-alert>

    <b-list-group v-else>
      <b-list-group-item
        v-for="{ name, created_at, path, size } in archives" :key="name"
        :to="{ name: 'backup-info', params: { name, id }}"
        :title="created_at | readableDate"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ created_at | distanceToNow }}
            <small class="text-secondary">{{ name }} ({{ size | humanSize }})</small>
          </h5>
          <p class="mb-0">
            {{ path }}
          </p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </view-base>
</template>

<script>
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'

export default {
  name: 'BackupList',

  props: {
    id: { type: String, required: true }
  },

  data () {
    return {
      queries: ['backup/archives?with_info'],
      archives: undefined
    }
  },

  methods: {
    formatBackupList (data) {
      const archives = Object.entries(data.archives)
      if (archives.length) {
        this.archives = archives.map(([name, infos]) => {
          infos.name = name
          return infos
        }).reverse()
      } else {
        this.archives = null
      }
    }
  },

  filters: {
    distanceToNow,
    readableDate,
    humanSize
  }
}
</script>
