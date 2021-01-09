<template>
  <view-search
    :items="apps" :filtered-items="filteredApps" items-name="apps"
    :queries="queries" @queries-response="formatAppData"
  >
    <template #top-bar>
      <div id="view-top-bar">
        <!-- APP SEARCH -->
        <b-input-group>
          <b-input-group-prepend is-text>
            <icon iname="search" />
          </b-input-group-prepend>
          <b-form-input
            id="search-input" :placeholder="$t('search.for', { items: $tc('items.apps', 2) })"
            v-model="search" @input="setCategory"
          />
          <b-input-group-append>
            <b-select v-model="quality" :options="qualityOptions" @change="setCategory" />
          </b-input-group-append>
        </b-input-group>

        <!-- CATEGORY SELECT -->
        <b-input-group class="mt-3">
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

        <!-- CATEGORIES SUBTAGS -->
        <b-input-group v-if="subtags" class="mt-3 subtags">
          <b-input-group-prepend is-text>
            Subtags
          </b-input-group-prepend>
          <b-form-radio-group
            id="subtags-radio" name="subtags"
            v-model="subtag" :options="subtags"
            buttons button-variant="outline-secondary"
          />
          <b-select id="subtags-select" v-model="subtag" :options="subtags" />
        </b-input-group>
      </div>
    </template>

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
            <span class="alert-warning p-1" v-b-popover.hover.top="$t('orphaned_details')">
              <icon iname="warning" /> {{ $t(app.maintained) }}
            </span>
          </b-card-text>
        </b-card-body>

        <!-- APP BUTTONS -->
        <b-button-group>
          <b-button :href="app.git.url" variant="outline-dark" target="_blank">
            <icon iname="code" /> {{ $t('code') }}
          </b-button>

          <b-button :href="app.git.url + '/blob/master/README.md'" variant="outline-dark" target="_blank">
            <icon iname="book" /> {{ $t('readme') }}
          </b-button>

          <b-button v-if="app.isInstallable" :variant="app.color" @click="onInstallClick(app)">
            <icon iname="plus" /> {{ $t('install') }} <icon v-if="app.color === 'danger'" class="ml-1" iname="warning" />
          </b-button>
          <b-button v-else :variant="app.color" disabled>
            {{ $t('installed') }}
          </b-button>
        </b-button-group>
      </b-card>
    </b-card-group>

    <template #bot>
      <!-- INSTALL CUSTOM APP -->
      <card-form
        :title="$t('custom_app_install')" icon="download"
        @submit.prevent="onCustomInstallClick" :submit-text="$t('install')"
        :validation="$v" class="mt-5"
      >
        <template #disclaimer>
          <div class="alert alert-warning">
            <icon iname="exclamation-triangle" /> {{ $t('confirm_install_custom_app') }}
          </div>
        </template>

        <!-- URL -->
        <form-field v-bind="customInstall.field" v-model="customInstall.url" :validation="$v.customInstall.url" />
      </card-form>
    </template>

    <!-- CUSTOM SKELETON -->
    <template #skeleton>
      <b-card-group deck>
        <b-card
          v-for="i in 15" :key="i"
          no-body style="min-height: 10rem;"
        >
          <div class="d-flex w-100 mt-auto">
            <b-skeleton width="30px" height="30px" class="mr-2 ml-auto" />
            <b-skeleton :width="randint(30, 70) + '%'" height="30px" class="mr-auto" />
          </div>
          <b-skeleton
            v-if="randint(0, 1)"
            :width="randint(30, 85) + '%'" height="24px" class="mx-auto"
          />
          <b-skeleton :width="randint(30, 85) + '%'" height="24px" class="mx-auto mb-auto" />
        </b-card>
      </b-card-group>
    </template>
  </view-search>
</template>

<script>
import { validationMixin } from 'vuelidate'

import { required, githubLink } from '@/helpers/validators'
import { randint } from '@/helpers/commons'

export default {
  name: 'AppCatalog',

  data () {
    return {
      queries: ['appscatalog?full&with_categories'],

      // Data
      apps: undefined,

      // Filtering options
      qualityOptions: [
        { value: 'isHighQuality', text: this.$i18n.t('only_highquality_apps') },
        { value: 'isDecentQuality', text: this.$i18n.t('only_decent_quality_apps') },
        { value: 'isWorking', text: this.$i18n.t('only_working_apps') },
        { value: 'all', text: this.$i18n.t('all_apps') }
      ],
      categories: [
        { text: this.$i18n.t('app_choose_category'), value: null },
        { text: this.$i18n.t('all_apps'), value: 'all', icon: 'search' }
        // The rest is filled from api data
      ],

      // Set by user inputs
      search: '',
      category: null,
      subtag: 'all',
      quality: 'isDecentQuality',

      // Custom install form
      customInstall: {
        field: {
          label: this.$i18n.t('url'),
          description: this.$i18n.t('custom_app_url_only_github'),
          props: {
            id: 'custom-install',
            placeholder: 'https://github.com/USER/REPOSITORY'
          }
        },
        url: ''
      }
    }
  },

  computed: {
    filteredApps () {
      if (!this.apps || this.category === null) return
      const search = this.search.toLowerCase()

      if (this.quality === 'all' && this.category === 'all' && search === '') {
        return this.apps
      }
      const filtered = this.apps.filter(app => {
        // app doesn't match quality filter
        if (this.quality !== 'all' && !app[this.quality]) return false
        // app doesn't match category filter
        if (this.category !== 'all' && app.category !== this.category) return false
        if (this.subtag !== 'all') {
          const appMatchSubtag = this.subtag === 'others'
            ? app.subtags.length === 0
            : app.subtags.includes(this.subtag)
          // app doesn't match subtag filter
          if (!appMatchSubtag) return false
        }
        if (search === '') return true
        if (app.searchValues.includes(search)) return true
        return false
      })
      return filtered.length ? filtered : null
    },

    subtags () {
      // build an options array for subtags v-model/options
      if (this.category) {
        const category = this.categories.find(cat => cat.value === this.category)
        if (category.subtags) {
          const subtags = [{ text: this.$i18n.t('all'), value: 'all' }]
           category.subtags.forEach(subtag => {
            subtags.push({ text: subtag.title, value: subtag.id })
          })
          subtags.push({ text: this.$i18n.t('others'), value: 'others' })
          return subtags
        }
      }
      return null
    }
  },

  validations: {
    customInstall: {
      url: { required, githubLink }
    }
  },

  methods: {
    formatQuality (app) {
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
      if (app.level <= 4 || app.level === '?') {
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

    formatColor (app) {
      if (app.isHighQuality) return 'best'
      if (app.isDecentQuality) return 'success'
      if (app.isWorking) return 'warning'
      return 'danger'
    },

    formatAppData (data) {
      // APPS
      const apps = []
      for (const key in data.apps) {
        const app = data.apps[key]
        if (app.state === 'notworking') continue

        Object.assign(app, this.formatQuality(app))
        app.isInstallable = !app.installed || app.manifest.multi_instance
        if (app.maintained !== 'request_adoption') {
          app.maintained = app.maintained ? 'maintained' : 'orphaned'
        }
        app.color = this.formatColor(app)
        app.searchValues = [app.id, app.state, app.manifest.name.toLowerCase(), app.manifest.description.toLowerCase()].join(' ')
        apps.push(app)
      }
      this.apps = apps.sort((a, b) => a.id > b.id ? 1 : -1)

      // CATEGORIES
      data.categories.forEach(({ title, id, icon, subtags, description }) => {
        this.categories.push({ text: title, value: id, icon, subtags, description })
      })
    },

    setCategory () {
      // allow search without selecting a category
      if (this.category === null) {
        this.category = 'all'
      }
    },

    // INSTALL APP
    async onInstallClick (app) {
      if (!app.isDecentQuality) {
        // Ask for confirmation
        const state = app.color === 'danger' ? 'inprogress' : app.state
        const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_install_app_' + state))
        if (!confirmed) return
      }
      this.$router.push({ name: 'app-install', params: { id: app.id } })
    },

    // INSTALL CUSTOM APP
    async onCustomInstallClick () {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_install_custom_app'))
      if (!confirmed) return

      const url = this.customInstall.url
      this.$router.push({
        name: 'app-install-custom',
        params: { id: url.endsWith('/') ? url : url + '/' }
      })
    },

    randint
  },

  mixins: [validationMixin]
}
</script>

<style lang="scss" scoped>
#view-top-bar {
  margin-bottom: 2rem;

  #search-input {
    min-width: 8rem;
  }

  select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .subtags {
    #subtags-radio {
      display: none
    }
    @include media-breakpoint-up(md) {
      #subtags-radio {
        display: inline-flex;
      }
      #subtags-select {
        display: none;
      }
    }
  }
}

.card-deck {
  .card {
    border-color: $gray-400;
    margin-bottom: 2rem;
    flex-basis: 90%;
    @include media-breakpoint-up(md) {
      flex-basis: 50%;
      max-width: calc(50% - 30px);
    }
    @include media-breakpoint-up(lg) {
      flex-basis: 33%;
      max-width: calc(33.3% - 30px);
    }

    // not maintained info
    .alert-warning {
      font-size: .75em;
    }
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

  .btn-group {
    .btn {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom: 0;
      flex-basis: 0;
      padding-left: 0;
      padding-right: 0;
    }
    .btn:first-of-type {
      border-left: 0;
    }
    .btn:last-of-type {
      border-right: 0;
    }
  }

  .btn-outline-dark {
    border-color: $gray-400;

    &:hover {
      border-color: $dark;
    }
  }
}
</style>
