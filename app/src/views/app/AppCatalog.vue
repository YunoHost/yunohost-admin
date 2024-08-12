<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api from '@/api'
import CardDeckFeed from '@/components/CardDeckFeed.vue'
import { useForm, useFormQuery } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { useSearch } from '@/composables/useSearch'
import { pick } from '@/helpers/commons'
import { appRepoUrl, required } from '@/helpers/validators'
import type { Catalog } from '@/types/core/api'
import type { FieldProps, FormFieldDict } from '@/types/form'
import { formatAppQuality } from './appData'

const props = withDefaults(
  defineProps<{
    search?: string
    quality?: 'all' | 'highQuality' | 'decentQuality' | 'working'
    category?: 'all' | string | null
    subtag?: 'all' | 'others' | string
  }>(),
  {
    search: '',
    quality: 'decentQuality',
    category: null,
    subtag: 'all',
  },
)

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

const [apps, categories] = await api
  .get<Catalog>({
    uri: 'apps/catalog?full&with_categories&with_antifeatures',
    initial: true,
  })
  .then((catalog) => {
    const apps = Object.values(catalog.apps)
      .map((app) => {
        const working = app.state === 'working'
        return {
          ...pick(app, ['id', 'category', 'subtags', 'maintained']),
          ...pick(app.manifest, ['name', 'description']),
          quality: formatAppQuality({ level: app.level, state: app.state }),
          working,
          decentQuality: working && app.level > 4,
          highQuality: working && app.level >= 8,
          logoHash: app.logo_hash,
          searchValues: [
            app.id,
            app.state,
            app.manifest.name,
            app.manifest.description,
            app.potential_alternative_to.join(' '),
          ]
            .join(' ')
            .toLowerCase(),
        }
      })
      .sort((a, b) => (a.id > b.id ? 1 : -1))

    // CATEGORIES
    const categories = [
      { text: t('app_choose_category'), value: null, subtags: [] },
      { text: t('all_apps'), value: 'all', icon: 'search', subtags: [] },
      ...catalog.categories.map(({ title, id, ...rest }) => {
        return { text: title, value: id, ...rest }
      }),
    ]

    return [apps, categories] as const
  })

const {
  quality,
  category,
  subtag,
  search: externalSearch,
} = useFormQuery(props, () => {
  if (props.category === null) return { ...props, category: 'all' }
})

const [search, filteredApps] = useSearch(
  apps,
  (s, app) => {
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
    if (s === '') return true
    if (app.searchValues.includes(s)) return true
    return false
  },
  {
    externalSearch,
    filterIfNoSearch: true,
    filterAllFn(s) {
      if (props.category === null) return false
      if (props.quality === 'all' && props.category === 'all' && s === '') {
        return true
      }
    },
  },
)

const form = ref({ url: '' })
const fields = {
  url: {
    component: 'InputItem',
    label: t('url'),
    rules: { required, appRepoUrl },
    cProps: {
      id: 'custom-install',
      placeholder: 'https://some.git.forge.tld/USER/REPOSITORY',
    },
  } satisfies FieldProps<'InputItem', string>,
} satisfies FormFieldDict<typeof form.value>
const { v, onSubmit } = useForm(form, fields)

const qualityOptions = [
  { value: 'highQuality', text: t('only_highquality_apps') },
  {
    value: 'decentQuality',
    text: t('only_decent_quality_apps'),
  },
  { value: 'working', text: t('only_working_apps') },
  { value: 'all', text: t('all_apps') },
]

const subtags = computed(() => {
  // build an options array for subtags v-model/options
  if (props.category && categories.length > 2) {
    const category = categories.find((cat) => cat.value === props.category)!
    if (category.subtags.length) {
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

// INSTALL CUSTOM APP
const onCustomInstallClick = onSubmit(async () => {
  const confirmed = await modalConfirm(t('confirm_install_custom_app'))
  if (!confirmed) return

  const url = form.value.url
  router.push({
    name: 'app-install-custom',
    params: { id: url.endsWith('/') ? url : url + '/' },
  })
})
</script>

<template>
  <ViewSearch :items="filteredApps" items-name="apps">
    <template #top-bar>
      <div id="view-top-bar">
        <!-- APP SEARCH -->
        <BInputGroup>
          <BInputGroupText>
            <YIcon iname="search" />
          </BInputGroupText>

          <BFormInput
            id="search-input"
            v-model="search"
            :placeholder="$t('search.for', { items: $t('items.apps', 2) })"
          />

          <BFormSelect v-model="quality" :options="qualityOptions" />
        </BInputGroup>

        <!-- CATEGORY SELECT -->
        <BInputGroup class="mt-3">
          <BInputGroupText>
            <YIcon iname="filter" />
          </BInputGroupText>

          <BFormSelect v-model="category" :options="categories" />

          <BButton
            variant="primary"
            :disabled="category === null"
            @click="category = null"
          >
            {{ $t('app_show_categories') }}
          </BButton>
        </BInputGroup>

        <!-- CATEGORIES SUBTAGS -->
        <BInputGroup v-if="subtags" class="mt-3 subtags">
          <BInputGroupText>Subtags</BInputGroupText>

          <BFormRadioGroup
            id="subtags-radio"
            v-model="subtag"
            name="subtags"
            :options="subtags"
            buttons
            button-variant="outline-secondary"
          />

          <BFormSelect
            id="subtags-select"
            v-model="subtag"
            :options="subtags"
          />
        </BInputGroup>
      </div>
    </template>

    <!-- CATEGORIES CARDS -->
    <template v-if="category === null" #forced-default>
      <BCardGroup deck tag="ul" class="p-0 m-0">
        <BCard
          v-for="cat in categories.slice(1)"
          :key="cat.text"
          tag="li"
          class="category-card"
        >
          <BCardTitle>
            <BLink class="card-link" @click.prevent="category = cat.value">
              <YIcon v-if="cat.icon" :iname="cat.icon" /> {{ cat.text }}
            </BLink>
          </BCardTitle>
          <BCardText v-if="'description' in cat">{{
            cat.description
          }}</BCardText>
        </BCard>
      </BCardGroup>
    </template>

    <CardDeckFeed v-if="filteredApps">
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
            v-if="app.logoHash"
            class="app-logo rounded"
            :src="`./applogos/${app.logoHash}.png`"
          />

          <div>
            <BCardTitle :id="`${app.id}-title`" class="d-flex mb-2">
              <BLink
                :to="{ name: 'app-install', params: { id: app.id } }"
                class="card-link"
              >
                {{ app.name }}
              </BLink>

              <small
                v-if="app.quality.state !== 'working' || app.highQuality"
                class="d-flex align-items-center ms-2 position-relative"
              >
                <BBadge
                  v-if="app.quality.state !== 'working'"
                  v-b-popover.hover.bottom="
                    $t(`app_state_${app.quality.state}_explanation`)
                  "
                  :variant="app.quality.variant"
                >
                  {{ $t(`app_state_${app.quality.state}`) }}
                </BBadge>

                <YIcon
                  v-if="app.highQuality"
                  v-b-popover.hover.bottom="
                    $t(`app_state_highquality_explanation`)
                  "
                  iname="star"
                  class="star"
                />
              </small>
            </BCardTitle>

            <BCardText :id="`${app.id}-desc`">
              {{ app.description }}
            </BCardText>

            <BCardText
              v-if="!app.maintained"
              class="align-self-end position-relative mt-auto"
            >
              <span
                v-b-popover.hover.top="$t('orphaned_details')"
                class="alert-warning p-1"
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
        v-model="form"
        icon="download"
        :fields="fields"
        :submit-text="$t('install')"
        :title="$t('custom_app_install')"
        :validations="v"
        class="mt-5"
        @submit.prevent="onCustomInstallClick"
      >
        <template #disclaimer>
          <div class="alert alert-warning">
            <YIcon iname="exclamation-triangle" />
            {{ $t('confirm_install_custom_app') }}
          </div>
        </template>
      </CardForm>
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
  .card {
    flex-basis: 100%;
    outline: none;

    @include media-breakpoint-up(md) {
      flex-basis: 50%;
      max-width: calc(50% - 0.75rem);
    }

    @include media-breakpoint-up(lg) {
      flex-basis: 33%;
      max-width: calc(33.3% - 1rem);
    }

    &:hover {
      color: $white;
      background-color: $dark;
      border-color: $dark;
    }
    &:focus {
      box-shadow: 0 0 0 $btn-focus-width rgba($dark, 0.5);
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
