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
        v-model="search" @input="setCategory"
      />
      <b-input-group-append>
        <b-select v-model="quality" :options="qualityOptions" @change="setCategory" />
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
    <b-card-group v-else-if="filteredApps.length > 0" deck>
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

          <b-button v-if="app.isInstallable" :variant="app.color" @click="onAppInstallClick(app)">
            <icon iname="plus" /> {{ $t('install') }} <icon v-if="app.color === 'danger'" class="ml-1" iname="warning" />
          </b-button>
          <b-button v-else :variant="app.color" disabled>
            {{ $t('installed') }}
          </b-button>
        </b-button-group>
      </b-card>
    </b-card-group>

    <!-- NO APPS -->
    <b-alert
      v-else
      variant="warning" show class="mt-4"
    >
      <icon iname="exclamation-triangle" /> {{ $t('app_not_found') }}
    </b-alert>

    <!-- INSTALL CUSTOM APP -->
    <b-card class="basic-form mt-5">
      <template v-slot:header>
        <h2><icon iname="download" /> {{ $t('custom_app_install') }}</h2>
      </template>

      <b-form id="custom-app-form" @submit.prevent="onSubmit">
        <b-alert variant="warning" show>
          <icon iname="exclamation-triangle" /> {{ $t('confirm_install_custom_app') }}
        </b-alert>

        <!-- URL -->
        <input-helper
          id="url" :label="$t('url')"
          v-model="form.url" placeholder="https://github.com/USER/REPOSITORY"
          :state="form.isValid" :error="form.error" @input="validateUrl"
        >
          <template v-slot:description>
            <icon iname="github" /> {{ $t('custom_app_url_only_github') }}
          </template>
        </input-helper>
      </b-form>

      <template v-slot:footer>
        <b-button
          variant="success"
          :disabled="form.url === '' || form.isValid === false"
          v-b-modal.custom-app-install-modal
        >
          {{ $t('install') }}
        </b-button>
      </template>
    </b-card>

    <!-- CONFIRM APP INSTALL MODAL -->
    <b-modal
      id="app-install-modal" centered ref="app-install-modal"
      :ok-title="$t('install')" :title="$t('confirm_app_install')"
      :header-bg-variant="selectedApp.color"
      :header-text-variant="selectedApp.color === 'danger' ? 'light' : 'dark'"
      @ok="goToAppInstallForm"
    >
      {{ $t('confirm_install_app_' + selectedApp.state) }}
    </b-modal>

    <!-- CONFIRM CUSTOM APP INSTALL MODAL -->
    <b-modal
      id="custom-app-install-modal" centered
      :ok-title="$t('install')" :title="$t('confirm_app_install')"
      header-bg-variant="danger" header-text-variant="light"
      @ok="goToCustomAppInstallForm"
    >
      {{ $t('confirm_install_custom_app') }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/helpers/api'
import InputHelper from '@/components/InputHelper'

export default {
  name: 'AppCatalog',

  data () {
    return {
      searchAppsKeys: ['id', 'state', 'manifest.name'],
      qualityOptions: [
        { value: 'isHighQuality', text: this.$i18n.t('only_highquality_apps') },
        { value: 'isDecentQuality', text: this.$i18n.t('only_decent_quality_apps') },
        { value: 'isWorking', text: this.$i18n.t('only_working_apps') },
        { value: 'all', text: this.$i18n.t('all_apps') }
      ],
      // Computed/filled from api data
      categories: [
        { text: this.$i18n.t('app_choose_category'), value: null },
        { text: this.$i18n.t('all_apps'), value: 'all', icon: 'search' }
      ],
      apps: undefined,
      // Set by user inputs
      category: null,
      search: '',
      quality: 'all',
      selectedApp: {
        // Set some basic values to avoid modal errors
        state: 'lowquality',
        color: 'warning'
      },
      form: {
        url: '',
        isValid: null,
        error: this.$i18n.t('form_errors.not_github_link')
      }
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

    setCategory () {
      // allow search without selecting a category
      if (this.category === null) {
        this.category = 'all'
      }
    },

    // INSTALL APP METHODS

    onAppInstallClick (app) {
      this.selectedApp = app
      if (!app.isDecentQuality) {
        // Ask for confirmation
        this.$refs['app-install-modal'].show()
      } else {
        this.goToAppInstallForm()
      }
    },

    goToAppInstallForm () {
      this.$router.push({ name: 'app-install', params: { id: this.selectedApp.id } })
    },

    // INSTALL CUSTOM APP METHODS

    validateUrl () {
      const match = this.form.url.match(/^https:\/\/github.com\/[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+[/]?$/)
      this.form.isValid = match ? null : false
    },

    goToCustomAppInstallForm () {
      this.$router.push({ name: 'app-install-custom', params: { id: this.form.url } })
    }
  },

  created () {
    this.fetchData()
  },

  components: {
    InputHelper
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
.card-deck {
  .card {
    margin-top: 2rem;
    flex-basis: 100%;
    @include media-breakpoint-up(md) {
      flex-basis: 50%;
      max-width: calc(50% - 30px);
    }
    @include media-breakpoint-up(lg) {
      flex-basis: 33%;
      max-width: calc(33.3% - 30px);
    }
  }

  .app-card {
    min-height: 12rem;
  }

  .category-card {
    @include media-breakpoint-up(sm) {
      min-height: 10rem;
    }
    border: 0;

    .btn {
      padding: 1rem;
      width: 100%;
      height: 100%;
    }
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
