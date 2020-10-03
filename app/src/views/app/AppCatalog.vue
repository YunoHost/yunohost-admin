<template>
  <div class="app-catalog" v-if="apps">
    <!-- CATEGORY SELECT -->
    <b-input-group class="mb-3">
      <b-input-group-prepend is-text>
        <icon iname="filter" />
      </b-input-group-prepend>
      <b-select v-model="category" :options="categories" />
      <b-input-group-append>
        <b-button variant="primary" :disabled="category === null" @click="category = null">
          {{ $t('app_show_categories') }}
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <!-- APP SEARCH -->
    <b-input-group>
      <b-input-group-prepend is-text>
        <icon iname="search" />
      </b-input-group-prepend>
      <b-form-input
        id="search-input" :placeholder="$t('search_for_apps')"
        v-model="search" @input="onSearchInput"
      />
      <b-input-group-append>
        <b-select v-model="quality" :options="qualityOptions" />
      </b-input-group-append>
    </b-input-group>

    <!-- CATEGORIES CARDS -->
    <b-card-group v-if="category === null" deck>
      <b-card
        v-for="cat in categories.slice(1)" :key="cat.value"
        class="category-card" no-body
      >
        <b-button variant="outline-dark" @click="category = cat.value">
          <b-card-title>
            <icon :iname="cat.icon" /> {{ cat.text }}
          </b-card-title>
          <b-card-text>{{ cat.description }}</b-card-text>
        </b-button>
      </b-card>
    </b-card-group>

    <!-- APPS CARDS -->
    <b-card-group v-else deck>
      <b-card no-body v-for="app in filteredApps" :key="app.id">
        <b-card-body class="d-flex flex-column">
          <b-card-title class="d-flex">
            {{ app.manifest.name }}
            <small v-if="app.state !== 'working'" class="ml-2">
              <b-badge
                :variant="(app.color === 'danger' && app.state === 'lowquality') ? 'warning' : app.color"
                v-b-popover.hover.bottom="$t(`app_state_${app.state}_explanation`)"
              >
                {{ $t('app_state_' + app.state) }}
              </b-badge>
            </small>
          </b-card-title>

          <b-card-text>{{ app.manifest.description }}</b-card-text>

          <b-card-text v-if="app.maintained === 'orphaned'" class="align-self-end mt-auto">
            <span v-if="app.maintained === 'orphaned'" class="alert-warning p-2" v-b-popover.hover.top="$t('orphaned_details')">
              <icon iname="warning" /> {{ $t(app.maintained) }}
            </span>
          </b-card-text>
        </b-card-body>

        <!-- APP BUTTONS -->
        <b-button-group>
          <b-button :href="app.git.url" :variant="'outline-' + app.color" target="_blank">
            <icon iname="code" /> {{ $t('code') }}
          </b-button>

          <b-button :href="app.git.url + '/blob/master/README.md'" :variant="'outline-' + app.color" target="_blank">
            <icon iname="book" /> {{ $t('readme') }}
          </b-button>

          <b-button v-if="app.isInstallable" :variant="app.color">
            <icon iname="plus" /> {{ $t('install') }} <icon v-if="app.color === 'danger'" class="ml-1" iname="warning" />
          </b-button>
          <b-button v-else :variant="app.color" disabled>
            {{ $t('installed') }}
          </b-button>
        </b-button-group>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
import api from '@/helpers/api'

export default {
  name: 'AppCatalog',

  data () {
    return {
      category: null,
      search: '',
      quality: 'all',
      searchAppsKeys: ['id', 'state', 'manifest.name'],
      qualityOptions: [
        { value: 'isHighQuality', text: this.$i18n.t('only_highquality_apps') },
        { value: 'isDecentQuality', text: this.$i18n.t('only_decent_quality_apps') },
        { value: 'isWorking', text: this.$i18n.t('only_working_apps') },
        { value: 'all', text: this.$i18n.t('all_apps') }
      ],
      // computed/filled from api data
      categories: [
        { text: this.$i18n.t('app_choose_category'), value: null },
        { text: this.$i18n.t('all_apps'), value: 'all', icon: 'search' }
      ],
      apps: undefined
    }
  },

  computed: {
    filteredApps () {
      const search = this.search.toLowerCase()
      function findValue (key, obj) {
        if (!key.includes('.')) return obj[key]
        // deep search in nested keys
        return key.split('.').reduce((obj, key) => obj[key], obj)
      }

      if (this.quality === 'all' && this.category === 'all' && search === '') {
        return this.apps
      }
      return this.apps.filter(app => {
        if (this.quality !== 'all' && !app[this.quality]) return false
        if (this.category !== 'all' && app.category !== this.category) return false
        if (search === '') return true
        const searchMatchSome = this.searchAppsKeys.some(searchKey => {
          return findValue(searchKey, app).toLowerCase().includes(search)
        })
        if (searchMatchSome) return true
        return false
      })
    }
  },

  methods: {
    fetchData () {
      api.get('appscatalog?full&with_categories').then((data) => {
        // APPS
        const apps = []
        for (const key in data.apps) {
          const app = data.apps[key]
          if (app.state === 'notworking') continue

          Object.assign(app, this.getQuality(app))
          app.isInstallable = !app.installed || app.manifest.multi_instance
          if (app.maintained !== 'request_adoption') {
            app.maintained = app.maintained ? 'maintained' : 'orphaned'
          }
          app.color = this.getColor(app)
          apps.push(app)
        }
        this.apps = apps.sort((a, b) => a.id > b.id ? 1 : -1)

        // CATEGORIES
        data.categories.forEach(({ title, id, icon, subTags, description }) => {
          this.categories.push({ text: title, value: id, icon, subTags, description })
        })
      })
    },

    getQuality (app) {
      const filters = {
        isHighQuality: false,
        isDecentQuality: false,
        isWorking: false,
        state: 'inprogress'
      }
      if (app.state === 'inprogress') return filters
      if (app.state === 'working' && app.level > 0) {
        filters.state = 'working'
        filters.isWorking = true
      }
      if (app.level <= 4) {
        filters.state = 'lowquality'
        return filters
      } else {
        filters.isDecentQuality = true
      }
      if (app.high_quality && app.level > 7) {
        filters.state = 'highquality'
        filters.isHighQuality = true
      }
      return filters
    },

    getColor (app) {
      if (app.isHighQuality) return 'best'
      if (app.isDecentQuality) return 'success'
      if (app.isWorking) return 'warning'
      return 'danger'
    },

    onSearchInput () {
      // allow search without selecting a category
      if (this.category === null) {
        this.category = 'all'
      }
    }
  },

  created () {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
#search-input {
  min-width: 8rem;
}

select {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.card {
  margin-top: 2rem;
  flex-basis: 100%;
  min-height: 12rem;
  @include media-breakpoint-up(md) {
    flex-basis: 50%;
    max-width: calc(50% - 30px);
  }
  @include media-breakpoint-up(lg) {
    flex-basis: 33%;
    max-width: calc(33.3% - 30px);
  }

}
.category-card {
  min-height: 10rem;
  border: 0;

  .btn {
    width: 100%;
    height: 100%;
  }
}

.btn-group {
  .btn {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom: 0;
    flex-basis: 0;
  }
  .btn:first-of-type {
    border-left: 0
  }
  .btn:last-of-type {
    border-right: 0
  }
}
</style>
