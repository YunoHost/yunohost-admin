<template>
  <view-search
    :search.sync="search"
    items-name="installed_apps"
    :items="apps"
    :filtered-items="filteredApps"
    :queries="queries"
    @queries-response="onQueriesResponse"
  >
    <template #top-bar-buttons>
      <b-button variant="success" :to="{ name: 'app-catalog' }">
        <icon iname="plus" />
        {{ $t('install') }}
      </b-button>
    </template>

    <b-list-group>
      <b-list-group-item
        v-for="{ id, description, label } in filteredApps" :key="id"
        :to="{ name: 'app-info', params: { id }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ label }}
            <small class="text-secondary">{{ id }}</small>
          </h5>
          <p class="m-0">
            {{ description }}
          </p>
        </div>

        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </view-search>
</template>

<script>
export default {
  name: 'AppList',

  data () {
    return {
      queries: [
        ['GET', 'apps?full']
      ],
      search: '',
      apps: undefined
    }
  },

  computed: {
    filteredApps () {
      if (!this.apps) return
      const search = this.search.toLowerCase()
      const match = (item) => item && item.toLowerCase().includes(search)
      // Check if any value in apps (label, id, name, description) match the search query.
      const filtered = this.apps.filter(app => Object.values(app).some(match))
      return filtered.length ? filtered : null
    }
  },

  methods: {
    onQueriesResponse ({ apps }) {
      if (apps.length === 0) {
        this.apps = null
        return
      }

      this.apps = apps.map(({ id, name, description, manifest }) => {
        return { id, name: manifest.name, label: name, description }
      }).sort((prev, app) => {
        return prev.label > app.label ? 1 : -1
      })
    }
  }
}
</script>
