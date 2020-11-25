<template>
  <div class="app-list">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input
          :disabled="!apps"
          id="search-app" v-model="search"
          :placeholder="$t('search.installed_app')"
        />
      </b-input-group>
      <div class="buttons">
        <b-button variant="success" :to="{ name: 'app-catalog' }">
          <icon iname="plus" /> {{ $t('install') }}
        </b-button>
      </div>
    </div>

    <template v-if="apps !== undefined">
      <b-alert v-if="apps === null" variant="warning" show>
        <icon iname="exclamation-triangle" /> {{ $t('no_installed_apps') }}
      </b-alert>

      <b-list-group v-else-if="filteredApps && filteredApps.length">
        <b-list-group-item
          v-for="{ id, name, description, label } in filteredApps" :key="id"
          :to="{ name: 'app-info', params: { id }}"
          class="d-flex justify-content-between align-items-center pr-0"
        >
          <div>
            <h5 class="font-weight-bold">{{ label }}
              <small v-if="name" class="text-secondary">{{ name }}</small>
            </h5>
            <p class="m-0">
              {{ description }}
            </p>
          </div>

          <icon iname="chevron-right" class="lg fs-sm ml-auto" />
        </b-list-group-item>
      </b-list-group>
      <b-alert v-else variant="warning" show>
        <icon iname="exclamation-triangle" /> {{ $t('search.not_found.installed_app') }}
      </b-alert>
    </template>
  </div>
</template>

<script>
import api from '@/api'

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
      const match = (item) => item.toLowerCase().includes(search)
      // Check if any value in apps (label, id, name, description) match the search query.
      return this.apps.filter(app => Object.values(app).some(match))
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
  }
}
</script>

<style>

</style>
