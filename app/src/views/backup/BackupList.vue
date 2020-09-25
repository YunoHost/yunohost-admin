<template>
  <div class="backup-list">
    <div class="actions">
      <div class="buttons ml-auto">
        <b-button variant="success" :to="{ name: 'backup-create' }">
          <icon iname="plus" /> {{ $t('backup_new') }}
        </b-button>
      </div>
    </div>

    <b-alert v-if="!archives" variant="warning" show>
      <icon iname="exclamation-triangle" /> {{ $t('backups_no') }}
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
          <p class="mb-0">{{ path }}</p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import api from '@/helpers/api'
import { distanceToNow, readableDate } from '@/filters/date'
import { humanSize } from '@/filters/size'

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

  filters: {
    distanceToNow,
    readableDate,
    humanSize
  },

  methods: {
    fetchData () {
      api.get('backup/archives?with_info').then(({ archives }) => {
        this.archives = Object.entries(archives).map(([name, data]) => {
          data.name = name
          return data
        }).reverse()
      })
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
