<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import CardDeckFeed from '@/components/CardDeckFeed.vue'
import { useAutoModal } from '@/composables/useAutoModal'
import { randint } from '@/helpers/commons'
import { appRepoUrl, required } from '@/helpers/validators'

const props = withDefaults(
  defineProps<{
    search?: string
    quality?: string
    category?: string | null
    subtag?: string
  }>(),
  {
    search: '',
    quality: 'decent_quality',
    category: null,
    subtag: 'all',
  },
)

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const modalConfirm = useAutoModal()

const queries = [['GET', 'apps/catalog?full&with_categories&with_antifeatures']]

const apps = ref()
const selectedApp = ref()
const antifeatures = ref()
const url = ref()
const v$ = useVuelidate({ url: { required, appRepoUrl } }, { url })

const qualityOptions = [
  { value: 'high_quality', text: t('only_highquality_apps') },
  {
    value: 'decent_quality',
    text: t('only_decent_quality_apps'),
  },
  { value: 'working', text: t('only_working_apps') },
  { value: 'all', text: t('all_apps') },
]
const categories = reactive([
  { text: t('app_choose_category'), value: null },
  { text: t('all_apps'), value: 'all', icon: 'search' },
  // The rest is filled from api data
])

const filteredApps = computed(() => {
  if (!apps.value || props.category === null) return
  const search = props.search.toLowerCase()

  if (props.quality === 'all' && props.category === 'all' && search === '') {
    return apps.value
  }
  const filtered = apps.value.filter((app) => {
    // app doesn't match quality filter
    if (props.quality !== 'all' && !app[props.quality]) return false
    // app doesn't match category filter
    if (props.category !== 'all' && app.category !== props.category)
      return false
    if (props.subtag !== 'all') {
      const appMatchSubtag =
        props.subtag === 'others'
          ? app.subtags.length === 0
          : app.subtags.includes(props.subtag)
      // app doesn't match subtag filter
      if (!appMatchSubtag) return false
    }
    if (search === '') return true
    if (app.searchValues.includes(search)) return true
    return false
  })
  return filtered.length ? filtered : null
})

const subtags = computed(() => {
  // build an options array for subtags v-model/options
  if (props.category && categories.length > 2) {
    const category = categories.find((cat) => cat.value === props.category)
    if (category.subtags) {
      const subtags = [{ text: t('all'), value: 'all' }]
      category.subtags.forEach((subtag) => {
        subtags.push({ text: subtag.title, value: subtag.id })
      })
      subtags.push({ text: t('others'), value: 'others' })
      return subtags
    }
  }
  return null
})

function onQueriesResponse(data) {
  const apps = []
  for (const key in data.apps) {
    const app = data.apps[key]
    app.isInstallable =
      !app.installed || app.manifest.integration.multi_instance
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
      app.potential_alternative_to.join(' '),
    ]
      .join(' ')
      .toLowerCase()
    apps.push(app)
  }
  apps.value = apps.sort((a, b) => (a.id > b.id ? 1 : -1))

  // CATEGORIES
  data.categories.forEach(({ title, id, icon, subtags, description }) => {
    categories.push({
      text: title,
      value: id,
      icon,
      subtags,
      description,
    })
  })
  antifeatures.value = Object.fromEntries(
    data.antifeatures.map((af) => [af.id, af]),
  )
}

function updateQuery(key, value) {
  // Update the query string without reloading the page
  router.replace({
    query: {
      ...route.query,
      // allow search without selecting a category
      category: route.query.category || 'all',
      [key]: value,
    },
  })
}

// INSTALL APP
async function onInstallClick(appId: string) {
  const app = apps.value.find((app) => app.id === appId)
  if (!app.decent_quality) {
    const confirmed = await modalConfirm(t('confirm_install_app_' + app.state))
    if (!confirmed) return
  }
  router.push({ name: 'app-install', params: { id: app.id } })
}

// INSTALL CUSTOM APP
async function onCustomInstallClick() {
  const confirmed = await modalConfirm(t('confirm_install_custom_app'))
  if (!confirmed) return

  const url_ = url.value
  router.push({
    name: 'app-install-custom',
    params: { id: url_.endsWith('/') ? url_ : url_ + '/' },
  })
}
</script>

<template>
  <ViewSearch
    :items="apps"
    :filtered-items="filteredApps"
    items-name="apps"
    :queries="queries"
    @queries-response="onQueriesResponse"
  >
    <template #top-bar>
      <div id="view-top-bar">
        <!-- APP SEARCH -->
        <BInputGroup>
          <BInputGroupText>
            <YIcon iname="search" />
          </BInputGroupText>

          <BFormInput
            id="search-input"
            :placeholder="$t('search.for', { items: $t('items.apps', 2) })"
            :modelValue="search"
            @update:modelValue="updateQuery('search', $event)"
          />

          <BFormSelect
            :modelValue="quality"
            :options="qualityOptions"
            @update:modelValue="updateQuery('quality', $event)"
          />
        </BInputGroup>

        <!-- CATEGORY SELECT -->
        <BInputGroup class="mt-3">
          <BInputGroupText>
            <YIcon iname="filter" />
          </BInputGroupText>

          <BFormSelect
            :modelValue="category"
            :options="categories"
            @update:modelValue="updateQuery('category', $event)"
          />

          <BButton
            variant="primary"
            :disabled="category === null"
            @click="updateQuery('category', null)"
          >
            {{ $t('app_show_categories') }}
          </BButton>
        </BInputGroup>

        <!-- CATEGORIES SUBTAGS -->
        <BInputGroup v-if="subtags" class="mt-3 subtags">
          <BInputGroupText>Subtags</BInputGroupText>

          <BFormRadioGroup
            id="subtags-radio"
            name="subtags"
            :checked="subtag"
            :options="subtags"
            @change="updateQuery('subtag', $event)"
            buttons
            button-variant="outline-secondary"
          />

          <BFormSelect
            id="subtags-select"
            :modelValue="subtag"
            :options="subtags"
            @update:modelValue="updateQuery('subtag', $event)"
          />
        </BInputGroup>
      </div>
    </template>

    <!-- CATEGORIES CARDS -->
    <BCardGroup v-if="category === null" deck tag="ul">
      <BCard
        v-for="cat in categories.slice(1)"
        :key="cat.value"
        tag="li"
        class="category-card"
      >
        <BCardTitle>
          <BLink
            @click.prevent="updateQuery('category', cat.value)"
            class="card-link"
          >
            <YIcon :iname="cat.icon" /> {{ cat.text }}
          </BLink>
        </BCardTitle>
        <BCardText>{{ cat.description }}</BCardText>
      </BCard>
    </BCardGroup>

    <!-- APPS CARDS -->
    <CardDeckFeed v-else>
      <BCard
        v-for="(app, i) in filteredApps"
        :key="app.id"
        tag="article"
        :aria-labelledby="`${app.id}-title`"
        :aria-describedby="`${app.id}-desc`"
        tabindex="0"
        :aria-posinset="i + 1"
        :aria-setsize="filteredApps.length"
        no-body
        class="app-card"
      >
        <BCardBody class="d-flex">
          <BImg
            v-if="app.logo_hash"
            class="app-logo rounded"
            :src="`./applogos/${app.logo_hash}.png`"
          />

          <div>
            <BCardTitle :id="`${app.id}-title`" class="d-flex mb-2">
              <BLink
                :to="{ name: 'app-install', params: { id: app.id } }"
                class="card-link"
              >
                {{ app.manifest.name }}
              </BLink>

              <small
                v-if="app.state !== 'working' || app.high_quality"
                class="d-flex align-items-center ms-2 position-relative"
              >
                <BBadge
                  v-if="app.state !== 'working'"
                  :variant="app.color"
                  v-b-popover.hover.bottom="
                    $t(`app_state_${app.state}_explanation`)
                  "
                >
                  <!-- app.state can be 'lowquality' or 'inprogress' -->
                  {{ $t('app_state_' + app.state) }}
                </BBadge>

                <YIcon
                  v-if="app.high_quality"
                  iname="star"
                  class="star"
                  v-b-popover.hover.bottom="
                    $t(`app_state_highquality_explanation`)
                  "
                />
              </small>
            </BCardTitle>

            <BCardText :id="`${app.id}-desc`">
              {{ app.manifest.description }}
            </BCardText>

            <BCardText
              v-if="!app.maintained"
              class="align-self-end position-relative mt-auto"
            >
              <span
                class="alert-warning p-1"
                v-b-popover.hover.top="$t('orphaned_details')"
              >
                <YIcon iname="warning" /> {{ $t('orphaned') }}
              </span>
            </BCardText>
          </div>
        </BCardBody>
      </BCard>
    </CardDeckFeed>

    <template #bot>
      <!-- INSTALL CUSTOM APP -->
      <CardForm
        :title="$t('custom_app_install')"
        icon="download"
        @submit.prevent="onCustomInstallClick"
        :submit-text="$t('install')"
        :validation="v$"
        class="mt-5"
      >
        <template #disclaimer>
          <div class="alert alert-warning">
            <YIcon iname="exclamation-triangle" />
            {{ $t('confirm_install_custom_app') }}
          </div>
        </template>

        <!-- URL -->
        <FormField
          v-bind="customInstall.field"
          v-model="customInstall.url"
          :validation="v$.customInstall.url"
        />
      </CardForm>
    </template>

    <!-- CUSTOM SKELETON -->
    <template #skeleton>
      <BCardGroup deck>
        <BCard v-for="i in 15" :key="i" no-body style="min-height: 10rem">
          <div class="d-flex w-100 mt-auto">
            <BSkeleton width="30px" height="30px" class="me-2 ms-auto" />
            <BSkeleton
              :width="randint(30, 70) + '%'"
              height="30px"
              class="me-auto"
            />
          </div>
          <BSkeleton
            v-if="randint(0, 1)"
            :width="randint(30, 85) + '%'"
            height="24px"
            class="mx-auto"
          />
          <BSkeleton
            :width="randint(30, 85) + '%'"
            height="24px"
            class="mx-auto mb-auto"
          />
        </BCard>
      </BCardGroup>
    </template>
  </ViewSearch>
</template>

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
      display: none;
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
  display: flex;
  flex-flow: row wrap;

  > * {
    flex-basis: 100%;

    @include media-breakpoint-up(md) {
      flex-basis: 50%;
      max-width: calc(50% - 0.75rem);
    }

    @include media-breakpoint-up(lg) {
      flex-basis: 33%;
      max-width: calc(33.3% - 1rem);
    }
  }

  .card {
    &:hover {
      color: $white;
      background-color: $dark;
      border-color: $dark;
    }

    :deep(.card-link) {
      color: inherit;
      text-decoration: none;

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
      font-size: 0.75em;
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

    :deep(.card-body) {
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
        box-shadow: 0 0 0 $btn-focus-width rgba($dark, 0.5);
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
