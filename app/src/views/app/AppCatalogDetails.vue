<template>
  <b-modal
    v-bind="$attrs" v-on="$listeners"
    body-class="p-0"
    static lazy size="lg"
    :title="$t('app.preview.title')" :ok-title="$t('install')"
  >
    <b-overlay :show="app === undefined">
      <template v-if="app">
        <section class="p-3">
          <h3>{{ app.name }}</h3>

          <p v-if="app.alternatives" class="mt-3">
            <strong v-t="'app.potential_alternative_to'" />
            {{ app.alternatives }}
          </p>

          <vue-showdown :markdown="app.description" flavor="github" />

          <b-img
            v-if="app.image"
            :src="app.image"
            aria-hidden="true" class="d-block mb-3" fluid
          />

          <p>{{ $t('app.preview.version', { version: app.version }) }}</p>

          <b-button
            v-if="app.demo"
            :href="app.demo" variant="primary" target="_blank"
          >
            <icon iname="external-link" />
            {{ $t('app.preview.try_demo') }}
          </b-button>
        </section>

        <card-collapse
          id="app-warning" flush variant="warning"
          visible :title="$t('app.preview.before_install')"
        >
          <b-card-body>
            <strong v-t="'app.antifeatures'" class="d-block mb-1" />
            <ul class="antifeatures">
              <li v-for="antifeature in app.antifeatures" :key="antifeature.id">
                <icon :iname="antifeature.icon" class="md mr-1" />
                {{ antifeature.title }}
                <explain-what
                  :id="antifeature.id"
                  :title="antifeature.title"
                  :content="antifeature.description"
                />
              </li>
            </ul>

            <vue-showdown :markdown="app.preInstall" flavor="github" />
          </b-card-body>
        </card-collapse>

        <card-collapse id="app-integration" flush :title="$t('app.preview.integration.title')">
          <b-list-group flush tag="section">
            <yuno-list-group-item variant="info">
              {{ $t('app.preview.integration.archs') }} {{ app.integration.archs }}
            </yuno-list-group-item>
            <yuno-list-group-item :variant="app.integration.ldap ? 'success' : 'warning'">
              {{ $t(`app.preview.integration.ldap.${app.integration.ldap}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item :variant="app.integration.sso ? 'success' : 'warning'">
              {{ $t(`app.preview.integration.sso.${app.integration.sso}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item variant="info">
              {{ $t(`app.preview.integration.multi_instance.${app.integration.multi_instance}`) }}
            </yuno-list-group-item>
            <yuno-list-group-item variant="info">
              {{ $t('app.preview.integration.resources', app.integration.resources) }}
            </yuno-list-group-item>
          </b-list-group>
        </card-collapse>

        <card-collapse id="app-links" flush :title="$t('app.preview.links.title')">
          <b-list-group flush tag="section">
            <yuno-list-group-item v-for="[key, link] in app.links" :key="key" no-status>
              <b-link :href="link" target="_blank">
                {{ $t('app.preview.links.' + key) }}
              </b-link>
            </yuno-list-group-item>
          </b-list-group>
        </card-collapse>
      </template>
    </b-overlay>
  </b-modal>
</template>

<script>

import api from '@/api'
import CardCollapse from '@/components/CardCollapse'
import { formatI18nField } from '@/helpers/yunohostArguments'

export default {
  name: 'AppCatalogDetails',

  components: {
    CardCollapse
  },

  props: {
    appId: { type: String, required: true },
    antifeatures: { type: Object, required: true }
  },

  data () {
    return {
      app: undefined
    }
  },

  async created () {
    const { id, name, version, potential_alternative_to: alternatives, ...app } = await api.get('apps/manifest?app=' + this.appId)

    const archs = app.integration.architectures
    const integration = {
      archs: Array.isArray(archs) ? archs.join(this.$i18n.t('words.separator')) : archs,
      ldap: app.integration.ldap === '?' ? null : app.integration.ldap,
      sso: app.integration.sso === '?' ? null : app.integration.sso,
      multi_instance: app.integration.multi_instance,
      resources: {
        ram: app.integration.ram.runtime,
        disk: app.integration.disk
      }
    }

    const links = [
      ...['website', 'admindoc', 'code'].map((key) => ([key, app.upstream[key]])),
      ['package', app.remote.url],
      ['forum', `https://forum.yunohost.org/tag/${id}`]
    ].filter(([key, val]) => !!val)

    this.app = {
      id,
      name,
      alternatives: alternatives && alternatives.length ? alternatives.join(this.$i18n.t('words.separator')) : null,
      description: formatI18nField(app.doc.DESCRIPTION),
      image: app.image,
      demo: app.upstream.demo,
      version,
      preInstall: formatI18nField(app.notifications.pre_install.main),
      antifeatures: app.antifeatures?.map((af) => this.antifeatures[af]),
      integration,
      links
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .b-overlay-wrap {
  min-height: 40vh;
}

.antifeatures {
  padding-left: 1rem;

  li {
    list-style: none;
  }
}
</style>
