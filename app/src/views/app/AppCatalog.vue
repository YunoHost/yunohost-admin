<template>
  <view-search
    :items="apps" :filtered-items="filteredApps" items-name="apps"
    :queries="queries" @queries-response="onQueriesResponse"
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
            :value="search" @input="updateQuery('search', $event)"
          />
          <b-input-group-append>
            <b-select :value="quality" :options="qualityOptions" @change="updateQuery('quality', $event)" />
          </b-input-group-append>
        </b-input-group>

        <!-- CATEGORY SELECT -->
        <b-input-group class="mt-3">
          <b-input-group-prepend is-text>
            <icon iname="filter" />
          </b-input-group-prepend>
          <b-select :value="category" :options="categories" @change="updateQuery('category', $event)" />
          <b-input-group-append>
            <b-button variant="primary" :disabled="category === null" @click="updateQuery('category', null)">
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
            :checked="subtag" :options="subtags" @change="updateQuery('subtag', $event)"
            buttons button-variant="outline-secondary"
          />
          <b-select
            id="subtags-select" :value="subtag" :options="subtags"
            @change="updateQuery('subtag', $event)"
          />
        </b-input-group>
      </div>
    </template>

    <!-- CATEGORIES CARDS -->
    <b-card-group v-if="category === null" deck tag="ul">
      <b-card
        v-for="cat in categories.slice(1)" :key="cat.value"
        tag="li" class="category-card"
      >
        <b-card-title>
          <b-link @click="updateQuery('category', cat.value)" class="card-link">
            <icon :iname="cat.icon" /> {{ cat.text }}
          </b-link>
        </b-card-title>
        <b-card-text>{{ cat.description }}</b-card-text>
      </b-card>
    </b-card-group>

    <!-- APPS CARDS -->
    <card-deck-feed v-else>
      <b-card
        v-for="(app, i) in filteredApps" :key="app.id"
        tag="article" :aria-labelledby="`${app.id}-title`" :aria-describedby="`${app.id}-desc`"
        tabindex="0" :aria-posinset="i + 1" :aria-setsize="filteredApps.length"
        no-body class="app-card"
      >
        <b-card-body class="d-flex">
          <b-img v-if="app.logo_hash" class="app-logo rounded" :src="`./applogos/${app.logo_hash}.png`" />

          <div>
            <b-card-title :id="`${app.id}-title`" class="d-flex mb-2">
              <b-link :to="{ name: 'app-install', params: { id: app.id }}" class="card-link">
                {{ app.manifest.name }}
              </b-link>

              <small v-if="app.state !== 'working' || app.high_quality" class="d-flex align-items-center ml-2 position-relative">
                <b-badge
                  v-if="app.state !== 'working'"
                  :variant="app.color"
                  v-b-popover.hover.bottom="$t(`app_state_${app.state}_explanation`)"
                >
                  <!-- app.state can be 'lowquality' or 'inprogress' -->
                  {{ $t('app_state_' + app.state) }}
                </b-badge>

                <icon
                  v-if="app.high_quality" iname="star" class="star"
                  v-b-popover.hover.bottom="$t(`app_state_highquality_explanation`)"
                />
              </small>
            </b-card-title>

            <b-card-text :id="`${app.id}-desc`">
              {{ app.manifest.description }}
            </b-card-text>

            <b-card-text v-if="!app.maintained" class="align-self-end position-relative mt-auto">
              <span class="alert-warning p-1" v-b-popover.hover.top="$t('orphaned_details')">
                <icon iname="warning" /> {{ $t('orphaned') }}
              </span>
            </b-card-text>
          </div>
        </b-card-body>
      </b-card>
    </card-deck-feed>

    <app-catalog-details
      v-if="selectedApp"
      id="modal-app-info"
      :app-id="selectedApp"
      :antifeatures="antifeatures"
      @ok="onInstallClick(selectedApp)"
      @hide="selectedApp = undefined"
    />

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

import CardDeckFeed from '@/components/CardDeckFeed.vue'
import { required, appRepoUrl } from '@/helpers/validators'
import { randint } from '@/helpers/commons'

export default {
  name: 'AppCatalog',

  components: {
    CardDeckFeed
  },

  props: {
    search: { type: String, default: '' },
    quality: { type: String, default: 'decent_quality' },
    category: { type: String, default: null },
    subtag: { type: String, default: 'all' }
  },

  data () {
    return {
      queries: [
        ['GET', 'apps/catalog?full&with_categories&with_antifeatures']
      ],

      // Data
      apps: undefined,
      selectedApp: undefined,
      antifeatures: undefined,

      // Filtering options
      qualityOptions: [
        { value: 'high_quality', text: this.$i18n.t('only_highquality_apps') },
        { value: 'decent_quality', text: this.$i18n.t('only_decent_quality_apps') },
        { value: 'working', text: this.$i18n.t('only_working_apps') },
        { value: 'all', text: this.$i18n.t('all_apps') }
      ],
      categories: [
        { text: this.$i18n.t('app_choose_category'), value: null },
        { text: this.$i18n.t('all_apps'), value: 'all', icon: 'search' }
        // The rest is filled from api data
      ],

      // Custom install form
      customInstall: {
        field: {
          label: this.$i18n.t('url'),
          props: {
            id: 'custom-install',
            placeholder: 'https://some.git.forge.tld/USER/REPOSITORY'
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
      if (this.category && this.categories.length > 2) {
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
      url: { required, appRepoUrl }
    }
  },

  methods: {
    onQueriesResponse (data) {
      const apps = []
      for (const key in data.apps) {
        const app = data.apps[key]
        app.isInstallable = !app.installed || app.manifest.integration.multi_instance
        app.working = app.state === 'working'
        app.decent_quality = app.working && app.level > 4
        app.high_quality = app.working && app.level >= 8
        app.color = 'danger'
        if (app.working && app.level <= 0) {
          app.state = 'broken'
          app.color = 'danger'
        } else if (app.working && app.level <= 4) {
          app.state = 'lowquality'
          app.color = 'warning'
        } else if (app.working) {
          app.color = 'success'
        }
        app.searchValues = [
          app.id,
          app.state,
          app.manifest.name,
          app.manifest.description,
          app.potential_alternative_to.join(' ')
        ].join(' ').toLowerCase()
        apps.push(app)
      }
      this.apps = apps.sort((a, b) => a.id > b.id ? 1 : -1)

      // CATEGORIES
      data.categories.forEach(({ title, id, icon, subtags, description }) => {
        this.categories.push({ text: title, value: id, icon, subtags, description })
      })
      this.antifeatures = Object.fromEntries(data.antifeatures.map((af) => ([af.id, af])))
    },

    updateQuery (key, value) {
      // Update the query string without reloading the page
      this.$router.replace({
        query: {
          ...this.$route.query,
          // allow search without selecting a category
          category: this.$route.query.category || 'all',
          [key]: value
        }
      })
    },

    // INSTALL APP
    async onInstallClick (appId) {
      const app = this.apps.find((app) => app.id === appId)
      if (!app.decent_quality) {
        const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_install_app_' + app.state))
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
  padding: 0;
  margin-bottom: 0;

  > * {
    margin-bottom: 2rem;
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

  .card {
    @include hover() {
      color: color-yiq($dark);
      background-color: $dark;
      border-color: $dark;
    }

    .card-link {
      color: inherit;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }

    // not maintained info
    .alert-warning {
      font-size: .75em;
    }

    .star {
      color: goldenrod;
    }
  }

  .category-card {
    @include media-breakpoint-up(sm) {
      min-height: 10rem;
    }

    flex-basis: 90%;

    .card-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .card-link {
      outline: none;

      &::after {
        border: $btn-border-width solid transparent;
        @include transition($btn-transition);
        @include border-radius($btn-border-radius, 0);
      }

      &:focus::after {
        box-shadow: 0 0 0 $btn-focus-width rgba($dark, .5);
      }
    }
  }

  .app-card {
    min-height: 125px;
    text-align: start;

    .app-logo {
      align-self: flex-start;
      background-color: white;
      max-width: 91px;
      margin-right: 1rem;
    }
  }
}
</style>
