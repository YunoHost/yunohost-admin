<script setup lang="ts">
import { useStoreGetters } from '@/store/utils'

import RecursiveListGroup from '@/components/RecursiveListGroup.vue'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { useSearch } from '@/composables/useSearch'
import type { TreeRootNode } from '@/helpers/data/tree'
import type { ComputedRef } from 'vue'

const { mainDomain, domainsTree } = useStoreGetters()
const { loading } = useInitialQueries([
  { uri: 'domains', cachePath: 'domains' },
])

const [search, filteredTree] = useSearch(
  // FIXME rm ts type when moved to pinia or else
  domainsTree as ComputedRef<TreeRootNode | undefined>,
  (s, node) => node.id.includes(s),
)
</script>

<template>
  <ViewSearch
    id="domain-list"
    v-model="search"
    :items="filteredTree ? filteredTree.children : filteredTree"
    items-name="domains"
    :loading="loading"
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
      <!-- FIXME slot typing not appearing? -->
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
