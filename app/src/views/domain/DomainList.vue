<script setup lang="ts">
import api from '@/api'
import RecursiveListGroup from '@/components/RecursiveListGroup.vue'
import { useDomains } from '@/composables/data'
import { useSearch } from '@/composables/useSearch'

await api.fetch({ uri: 'domains', cachePath: 'domains' })

const { mainDomain, domainsTree } = useDomains()

const [search, filteredTree] = useSearch(domainsTree, (s, node) =>
  node.id.includes(s),
)
</script>

<template>
  <ViewSearch
    id="domain-list"
    v-model="search"
    :items="filteredTree ? filteredTree.children : filteredTree"
    items-name="domains"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'domain-add' }">
        <YIcon iname="plus" />
        {{ $t('domain_add') }}
      </BButton>
    </template>

    <RecursiveListGroup
      v-if="filteredTree"
      :tree="filteredTree"
      :toggle-text="$t('domain.toggle_subdomains')"
      class="mb-5"
    >
      <template #default="{ data, parent }">
        <div class="w-100 d-flex justify-content-between align-items-center">
          <h5 class="me-3">
            <BLink :to="data.to" class="text-body text-decoration-none">
              <span class="fw-bold">
                {{ data.name.replace(parent.data?.name ?? '', '') }}
              </span>
              <span v-if="parent?.data" class="text-secondary">
                {{ parent.data.name }}
              </span>
            </BLink>

            <small
              v-if="data.name === mainDomain"
              v-b-tooltip.hover
              :title="$t('domain.types.main_domain')"
              class="ms-1"
            >
              <YIcon iname="star" />
            </small>
          </h5>
        </div>
      </template>
    </RecursiveListGroup>
  </ViewSearch>
</template>
