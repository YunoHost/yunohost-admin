<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import api, { objectToParams } from '@/api'
import { APIBadRequestError, APIError } from '@/api/errors'
import { formatOptions } from '@/composables/configPanels'
import { useDomains } from '@/composables/data'
import { useForm } from '@/composables/form'
import { useAutoModal } from '@/composables/useAutoModal'
import { getKeys, joinOrNull } from '@/helpers/commons'
import { formatForm, formatI18nField } from '@/helpers/yunohostArguments'
import type { Obj } from '@/types/commons'
import type { AppManifest, Catalog } from '@/types/core/api'
import type { FormFieldProps } from '@/types/form'
import DomainForm from '@/views/_partials/DomainForm.vue'
import {
  formatAppIntegration,
  formatAppLinks,
  formatAppNotifs,
  formatAppQuality,
} from '@/views/app/appData'
import AppIntegrationAndLinks from './_AppIntegrationAndLinks.vue'

const props = defineProps<{
  id: string
}>()

const { t } = useI18n()
const router = useRouter()
const modalConfirm = useAutoModal()

const [app, form, fields] = await api
  .fetchAll<
    [Catalog, AppManifest]
  >([{ uri: 'apps/catalog?full&with_categories&with_antifeatures' }, { uri: `apps/manifest?app=${props.id}&with_screenshot` }])
  .then(([catalog, manifest]) => {
    const antifeaturesList = Object.fromEntries(
      catalog.antifeatures.map((af) => [af.id, af]),
    )
    const { id, name, version, screenshot, requirements } = manifest
    const quality = formatAppQuality(manifest.quality)
    const preInstall = formatI18nField(manifest.notifications.PRE_INSTALL?.main)
    const antifeatures = manifest.antifeatures?.length
      ? manifest.antifeatures.map((af) => {
          const antifeature = antifeaturesList[af]
          const customText = catalog.apps[id]?.manifest.antifeatures?.[af]
          if (customText) antifeature.description = formatI18nField(customText)
          return antifeature
        })
      : null
    const hasDanger = quality.variant === 'danger' || !requirements.ram.pass
    const hasSupport = getKeys(requirements).every((key) => {
      // ram support is non-blocking requirement and handled on its own.
      return key === 'ram' || requirements[key].pass
    })

    const app = {
      id,
      name,
      alternativeTo: joinOrNull(manifest.potential_alternative_to),
      description: formatI18nField(
        manifest.doc.DESCRIPTION || manifest.description,
      ),
      screenshot,
      demo: manifest.upstream.demo,
      version,
      license: manifest.upstream.license,
      integration: formatAppIntegration(
        manifest.integration,
        manifest.packaging_format,
      ),
      links: formatAppLinks(manifest),
      preInstall,
      antifeatures,
      quality,
      requirements,
      hasWarning: !!preInstall || antifeatures || quality.variant === 'warning',
      hasDanger,
      hasSupport,
      canInstall: hasSupport && !hasDanger,
    }

    const { form, fields } = formatOptions([
      // FIXME yunohost should add the label field by default
      {
        type: 'string',
        id: 'label',
        ask: t('label_for_manifestname', { name }),
        default: name,
        help: t('label_for_manifestname_help'),
        optional: false,
      },
      ...manifest.install,
    ])
    return [app, form, fields] as const
  })

const { domainsAsChoices } = useDomains()
const { v, onSubmit } = useForm(form, fields)
const force = ref(false)
const showAddDomainModal = ref(false)
const domainAddServerError = ref('')

const performInstall = onSubmit(async (onError) => {
  if ('path' in form.value && form.value.path === '/') {
    const confirmed = await modalConfirm(
      t('confirm_install_domain_root', { domain: form.value.domain }),
    )
    if (!confirmed) return
  }

  const { label, ...args } = await formatForm(form, { removeNullish: true })
  const data = {
    app: props.id,
    label,
    args: Object.entries(args).length ? objectToParams(args) : undefined,
  }

  api
    .post<{ notifications: Obj<string> }>({
      uri: 'apps',
      data,
      humanKey: { key: 'apps.install', name: app.name },
    })
    .then(async (response) => {
      const postInstall = formatAppNotifs(response.notifications)
      if (postInstall) {
        const message =
          t('app.install.notifs.post.alert') + '\n\n' + postInstall
        await modalConfirm(
          message,
          {
            title: t('app.install.notifs.post.title', {
              name: app.name,
            }),
          },
          { markdown: true, cancelable: false },
        )
      }
      router.push({ name: 'app-list' })
    })
    .catch(onError)
})

function onDomainAdd(data: {
  domain: string
  dyndns_recovery_password?: string
  install_letsencrypt_cert?: boolean
}) {
  api
    .post({
      uri: 'domains',
      cachePath: `domains.${data.domain}`,
      data,
      humanKey: { key: 'domains.add', name: data.domain },
    })
    .then(() => {
      form.value.domain = data.domain
      showAddDomainModal.value = false
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      domainAddServerError.value = err.message
    })
}
</script>

<template>
  <div>
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

      <AppIntegrationAndLinks
        :integration="app.integration"
        :links="app.links"
      />

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

        <div v-if="app.quality.state === 'lowquality'">
          <p v-t="'app.install.problems.lowquality'" />
          <VueShowdown class="mb-3" :markdown="t('app.upvote', { id })" />
        </div>

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

        <div
          v-if="
            ['inprogress', 'broken', 'thirdparty'].includes(app.quality.state)
          "
        >
          <p v-t="'app.install.problems.' + app.quality.state" />
          <VueShowdown class="mb-3" :markdown="t('app.upvote', { id })" />
        </div>

        <p v-if="!app.requirements.ram.pass">
          {{ $t('app.install.problems.ram', app.requirements.ram.values) }}
        </p>

        <CheckboxItem
          id="force-install"
          v-model="force"
          :label="$t('app.install.problems.ignore')"
        />
      </YAlert>

      <!-- INSTALL FORM -->
      <CardForm
        v-if="app.canInstall || force"
        v-model="form"
        :fields="fields"
        :title="$t('app_install_parameters')"
        icon="cog"
        :submit-text="$t('install')"
        :validations="v"
        @submit="performInstall"
      >
        <template v-if="form.domain" #field:domain="fieldProps">
          <FormField
            v-bind="fieldProps as FormFieldProps<'SelectItem', string>"
          >
            <template #default="componentProps">
              <BInputGroup>
                <SelectItem
                  v-bind="componentProps"
                  v-model="form.domain"
                  :options="domainsAsChoices"
                />
                <BButton variant="primary" @click="showAddDomainModal = true">
                  {{ t('domain_add') }}
                </BButton>
              </BInputGroup>
            </template>
          </FormField>
        </template>
      </CardForm>
    </template>

    <DomainForm
      v-model:show="showAddDomainModal"
      modal
      :submit-text="$t('add')"
      :server-error="domainAddServerError"
      :title="$t('domain_add')"
      @submit="onDomainAdd"
    />

    <!-- FIXME hum not handled, is it still a thing? -->
    <!-- In case of a custom url with no manifest found -->
    <YAlert
      v-if="app === null"
      alert
      icon="exclamation-triangle"
      variant="warning"
    >
      {{ $t('app_install_custom_no_manifest') }}
    </YAlert>
  </div>
</template>

<style lang="scss" scoped>
.antifeatures {
  dt::before {
    content: '• ';
  }
}
</style>
