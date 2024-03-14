<template>
  <ViewBase :queries="queries" @queries-response="onQueriesResponse">
    <template v-if="app">
      <section class="border rounded p-3 mb-4">
        <div class="d-md-flex align-items-center mb-4">
          <h1 class="mb-3 mb-md-0">
            {{ app.name }}
          </h1>

          <BButton
            v-if="app.demo"
            :href="app.demo"
            target="_blank"
            variant="primary"
            class="ms-auto"
          >
            <YIcon iname="external-link" />
            {{ $t('app.install.try_demo') }}
          </BButton>
        </div>

        <p class="text-secondary">
          {{ $t('app.install.version', { version: app.version }) }}<br />

          <template v-if="app.alternativeTo">
            {{ $t('app.potential_alternative_to') }} {{ app.alternativeTo }}
          </template>
        </p>

        <VueShowdown :markdown="app.description" />

        <BImg
          v-if="app.screenshot"
          :src="app.screenshot"
          aria-hidden="true"
          class="d-block"
          fluid
        />
      </section>

      <YCard
        v-if="app.integration"
        id="app-integration"
        :title="$t('app.integration.title')"
        collapsable
        collapsed
        no-body
      >
        <BListGroup flush>
          <YListGroupItem variant="info">
            {{ $t('app.integration.archs') }} {{ app.integration.archs }}
          </YListGroupItem>
          <YListGroupItem
            v-if="app.integration.ldap"
            :variant="app.integration.ldap === true ? 'success' : 'warning'"
          >
            {{ $t(`app.integration.ldap.${app.integration.ldap}`) }}
          </YListGroupItem>
          <YListGroupItem
            v-if="app.integration.sso"
            :variant="app.integration.sso === true ? 'success' : 'warning'"
          >
            {{ $t(`app.integration.sso.${app.integration.sso}`) }}
          </YListGroupItem>
          <YListGroupItem variant="info">
            {{
              $t(
                `app.integration.multi_instance.${app.integration.multi_instance}`,
              )
            }}
          </YListGroupItem>
          <YListGroupItem variant="info">
            {{ $t('app.integration.resources', app.integration.resources) }}
          </YListGroupItem>
        </BListGroup>
      </YCard>

      <YCard
        id="app-links"
        icon="link"
        :title="$t('app.links.title')"
        collapsable
        collapsed
        no-body
      >
        <template #header>
          <h2><YIcon iname="link" /> {{ $t('app.links.title') }}</h2>
        </template>

        <BListGroup flush>
          <YListGroupItem v-for="[key, link] in app.links" :key="key" no-status>
            <BLink :href="link" target="_blank">
              <YIcon :iname="appLinksIcons(key)" class="me-1" />
              {{ $t('app.links.' + key) }}
            </BLink>
          </YListGroupItem>
        </BListGroup>
      </YCard>

      <YAlert v-if="app.hasWarning" variant="warning" class="my-4">
        <h2>{{ $t('app.install.notifs.pre.warning') }}</h2>

        <template v-if="app.antifeatures">
          <strong v-t="'app.antifeatures'" class="d-block mb-2" />
          <dl class="antifeatures">
            <div v-for="antifeature in app.antifeatures" :key="antifeature.id">
              <dt class="d-inline">
                <YIcon :iname="antifeature.icon" class="md me-1" />
                {{ antifeature.title }}:
              </dt>
              <dd class="d-inline">
                {{ antifeature.description }}
              </dd>
            </div>
          </dl>
        </template>

        <p
          v-if="app.quality.state === 'lowquality'"
          v-t="'app.install.problems.lowquality'"
        />

        <VueShowdown v-if="app.preInstall" :markdown="app.preInstall" />
      </YAlert>

      <YAlert
        v-if="!app.hasSupport"
        variant="danger"
        icon="warning"
        class="my-4"
      >
        <h2>{{ $t('app.install.notifs.pre.critical') }}</h2>

        <p v-if="!app.requirements.arch.pass">
          {{ $t('app.install.problems.arch', app.requirements.arch.values) }}
        </p>
        <p v-if="!app.requirements.install.pass">
          {{
            $t('app.install.problems.install', app.requirements.install.values)
          }}
        </p>
        <p v-if="!app.requirements.required_yunohost_version.pass">
          {{
            $t(
              'app.install.problems.version',
              app.requirements.required_yunohost_version.values,
            )
          }}
        </p>
      </YAlert>

      <YAlert v-else-if="app.hasDanger" variant="danger" class="my-4">
        <h2>{{ $t('app.install.notifs.pre.danger') }}</h2>

        <p
          v-if="
            ['inprogress', 'broken', 'thirdparty'].includes(app.quality.state)
          "
          v-t="'app.install.problems.' + app.quality.state"
        />
        <p v-if="!app.requirements.ram.pass">
          {{ $t('app.install.problems.ram', app.requirements.ram.values) }}
        </p>

        <CheckboxItem
          v-model="force"
          id="force-install"
          :label="$t('app.install.problems.ignore')"
        />
      </YAlert>

      <!-- INSTALL FORM -->
      <CardForm
        v-if="app.canInstall || force"
        :title="$t('app_install_parameters')"
        icon="cog"
        :submit-text="$t('install')"
        :validation="v$"
        :server-error="serverError"
        @submit.prevent="performInstall"
      >
        <template v-for="(field, fname) in fields">
          <Component
            v-if="field.visible"
            v-bind="field.props"
            :is="field.is"
            v-model="form[fname]"
            :validation="v$.form[fname]"
            :key="fname"
          />
        </template>
      </CardForm>
    </template>

    <!-- In case of a custom url with no manifest found -->
    <BAlert v-else-if="app === null" variant="warning">
      <YIcon iname="exclamation-triangle" />
      {{ $t('app_install_custom_no_manifest') }}
    </BAlert>

    <template #skeleton>
      <CardInfoSkeleton />
      <CardFormSkeleton :cols="null" />
    </template>
  </ViewBase>
</template>

<script>
import { useVuelidate } from '@vuelidate/core'

import api, { objectToParams } from '@/api'
import {
  formatYunoHostArguments,
  formatI18nField,
  formatFormData,
} from '@/helpers/yunohostArguments'
import CardCollapse from '@/components/CardCollapse.vue'

export default {
  name: 'AppInstall',

  components: {
    CardCollapse,
  },

  props: {
    id: { type: String, required: true },
  },

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      queries: [
        ['GET', 'apps/catalog?full&with_categories&with_antifeatures'],
        ['GET', `apps/manifest?app=${this.id}&with_screenshot`],
      ],
      app: undefined,
      name: undefined,
      form: undefined,
      fields: undefined,
      validations: {},
      errors: undefined,
      serverError: '',
      force: false,
    }
  },

  validations() {
    return this.validations
  },

  methods: {
    appLinksIcons(linkType) {
      const linksIcons = {
        license: 'institution',
        website: 'globe',
        admindoc: 'book',
        userdoc: 'book',
        code: 'code',
        package: 'code',
        package_license: 'institution',
        forum: 'comments',
      }
      return linksIcons[linkType]
    },

    onQueriesResponse(catalog, _app) {
      const antifeaturesList = Object.fromEntries(
        catalog.antifeatures.map((af) => [af.id, af]),
      )

      const { id, name, version, requirements } = _app
      const {
        ldap,
        sso,
        multi_instance,
        ram,
        disk,
        architectures: archs,
      } = _app.integration

      const quality = { state: _app.quality.state, variant: 'danger' }
      if (quality.state === 'working') {
        if (_app.quality.level <= 0) {
          quality.state = 'broken'
        } else if (_app.quality.level <= 4) {
          quality.state = 'lowquality'
          quality.variant = 'warning'
        } else {
          quality.variant = 'success'
          quality.state =
            _app.quality.level >= 8 ? 'highquality' : 'goodquality'
        }
      }
      const preInstall = formatI18nField(_app.notifications.PRE_INSTALL.main)
      const antifeatures = _app.antifeatures?.length
        ? _app.antifeatures.map((af) => antifeaturesList[af])
        : null

      const hasDanger = quality.variant === 'danger' || !requirements.ram.pass
      const hasSupport = Object.keys(requirements).every((key) => {
        // ram support is non-blocking requirement and handled on its own.
        return key === 'ram' || requirements[key].pass
      })

      const app = {
        id,
        name,
        alternativeTo:
          _app.potential_alternative_to && _app.potential_alternative_to.length
            ? _app.potential_alternative_to.join(this.$t('words.separator'))
            : null,
        description: formatI18nField(_app.doc.DESCRIPTION || _app.description),
        screenshot: _app.screenshot,
        demo: _app.upstream.demo,
        version,
        license: _app.upstream.license,
        integration:
          _app.packaging_format >= 2
            ? {
                archs: Array.isArray(archs)
                  ? archs.join(this.$t('words.separator'))
                  : archs,
                ldap: ldap === 'not_relevant' ? null : ldap,
                sso: sso === 'not_relevant' ? null : sso,
                multi_instance,
                resources: { ram: ram.runtime, disk },
              }
            : null,
        links: [
          ['license', `https://spdx.org/licenses/${_app.upstream.license}`],
          ...['website', 'admindoc', 'userdoc', 'code'].map((key) => {
            return [key, _app.upstream[key]]
          }),
          ['package', _app.remote.url],
          ['package_license', _app.remote.url + '/blob/master/LICENSE'],
          ['forum', `https://forum.yunohost.org/tag/${id}`],
        ].filter(([key, val]) => !!val),
        preInstall,
        antifeatures,
        quality,
        requirements,
        hasWarning:
          !!preInstall || antifeatures || quality.variant === 'warning',
        hasDanger,
        hasSupport,
        canInstall: hasSupport && !hasDanger,
      }

      // FIXME yunohost should add the label field by default
      _app.install.unshift({
        ask: this.$t('label_for_manifestname', { name }),
        default: name,
        name: 'label',
        help: this.$t('label_for_manifestname_help'),
      })

      const { form, fields, validations, errors } = formatYunoHostArguments(
        _app.install,
      )

      this.app = app
      this.fields = fields
      this.form = form
      this.validations = { form: validations }
      this.errors = errors
    },

    formatAppNotifs(notifs) {
      return Object.keys(notifs).reduce((acc, key) => {
        return acc + '\n\n' + notifs[key]
      }, '')
    },

    async performInstall() {
      if ('path' in this.form && this.form.path === '/') {
        const confirmed = await this.$askConfirmation(
          this.$t('confirm_install_domain_root', {
            domain: this.form.domain,
          }),
        )
        if (!confirmed) return
      }

      const { data: args, label } = await formatFormData(this.form, {
        extract: ['label'],
        removeEmpty: false,
        removeNull: true,
      })
      const data = {
        app: this.id,
        label,
        args: Object.entries(args).length ? objectToParams(args) : undefined,
      }

      api
        .post('apps', data, { key: 'apps.install', name: this.app.name })
        .then(async ({ notifications }) => {
          const postInstall = this.formatAppNotifs(notifications)
          if (postInstall) {
            const message =
              this.$t('app.install.notifs.post.alert') + '\n\n' + postInstall
            await this.$askMdConfirmation(
              message,
              {
                title: this.$t('app.install.notifs.post.title', {
                  name: this.app.name,
                }),
                okTitle: this.$t('ok'),
              },
              true,
            )
          }
          this.$router.push({ name: 'app-list' })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          if (err.data.name) {
            this.errors[err.data.name].message = err.message
          } else this.serverError = err.message
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.antifeatures {
  dt::before {
    content: '• ';
  }
}
</style>
