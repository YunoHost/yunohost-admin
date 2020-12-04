<template>
  <div class="backup-list">
    <view-top-bar :button="{ text: $t('backup_new'), icon: 'plus', to: { name: 'backup-create' } }" />

    <b-alert v-if="!archives" variant="warning" show>
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
          <h5>
            {{ created_at | distanceToNow }}
            <small>{{ name }} ({{ size | humanSize }})</small>
          </h5>
          <p class="mb-0">
            {{ path }}
          </p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import api from '@/api'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'

export default {
  name: 'BackupList',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      archives: undefined
    }
  },

  methods: {
    fetchData () {
      api.get('backup/archives?with_info').then(data => {
        // FIXME use archives = null if no archives
        const archives = Object.entries(data.archives)
        this.archives = archives.length === 0 ? null : archives.map(([name, infos]) => {
          infos.name = name
          return infos
        }).reverse()
      })
    }
  },

  created () {
    this.fetchData()
  },

  filters: {
    distanceToNow,
    readableDate,
    humanSize
  }
}
</script>
