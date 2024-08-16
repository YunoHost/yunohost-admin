<script setup lang="ts">
import type { AppLinks, AppIntegration } from './appData'

defineProps<{
  links: AppLinks
  integration?: AppIntegration
}>()
</script>

<template>
  <YCard
    v-if="integration"
    id="app-integration"
    :title="$t('app.integration.title')"
    collapsible
    collapsed
    no-body
  >
    <BListGroup flush>
      <YListGroupItem variant="info">
        {{ $t('app.integration.archs') }} {{ integration.archs }}
      </YListGroupItem>
      <YListGroupItem
        v-if="integration.ldap"
        :variant="integration.ldap === true ? 'success' : 'warning'"
      >
        {{ $t(`app.integration.ldap.${integration.ldap}`) }}
      </YListGroupItem>
      <YListGroupItem
        v-if="integration.sso"
        :variant="integration.sso === true ? 'success' : 'warning'"
      >
        {{ $t(`app.integration.sso.${integration.sso}`) }}
      </YListGroupItem>
      <YListGroupItem variant="info">
        {{ $t(`app.integration.multi_instance.${integration.multiInstance}`) }}
      </YListGroupItem>
      <YListGroupItem variant="info">
        {{ $t('app.integration.resources', integration.resources) }}
      </YListGroupItem>
    </BListGroup>
  </YCard>

  <YCard
    id="app-links"
    icon="link"
    :title="$t('app.links.title')"
    collapsible
    collapsed
    no-body
  >
    <template #header>
      <h2><YIcon iname="link" /> {{ $t('app.links.title') }}</h2>
    </template>

    <BListGroup flush>
      <template v-for="([icon, link], key) in links" :key="key">
        <YListGroupItem v-if="link" no-status>
          <YIcon :iname="icon" class="me-3" />
          <BLink :href="link" target="_blank">
            {{ $t('app.links.' + key) }}
          </BLink>
        </YListGroupItem>
      </template>
    </BListGroup>
  </YCard>
</template>
