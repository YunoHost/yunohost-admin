<template>
  <search-view
    id="app-list"
    :search.sync="search"
    :items="apps"
    :filtered-items="filteredApps"
    items-name="installed_apps"
  >
    <template #top-bar-buttons>
      <b-button variant="success" :to="{ name: 'app-catalog' }">
        <icon iname="plus" />
        {{ $t('install') }}
      </b-button>
    </template>

    <b-list-group>
      <b-list-group-item
        v-for="{ id, name, description, label } in filteredApps" :key="id"
        :to="{ name: 'app-info', params: { id }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ label }}
            <small v-if="name" class="text-secondary">{{ name }}</small>
          </h5>
          <p class="m-0">
            {{ description }}
          </p>
        </div>

        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </search-view>
</template>

<script>
import api from '@/api'
import SearchView from '@/components/SearchView'

export default {
  name: 'AppList',

  data () {
    return {
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
      return filtered.length > 0 ? filtered : null
    }
  },

  methods: {
    fetchData () {
      api.get('apps?full').then(({ apps }) => {
        if (apps.length === 0) {
          this.apps = null
          return
        }

        const multiInstances = {}
        this.apps = apps.map(({ id, name, description, permissions, manifest }) => {
          // FIXME seems like some apps may no have a label (replace with id)
          const label = permissions[id + '.main'].label
          // Display the `id` of the instead of its `name` if multiple apps share the same name
          if (manifest.multi_instance) {
            if (!(name in multiInstances)) {
              multiInstances[name] = []
            }
            const labels = multiInstances[name]
            if (labels.includes(label)) {
              name = id
            }
            labels.push(label)
          }
          if (label === name) {
            name = null
          }
          return { id, name, description, label }
        }).sort((prev, app) => {
          return prev.label > app.label ? 1 : -1
        })
      })
    }
  },

  created () {
    this.fetchData()
  },

  components: { SearchView }
}
</script>
