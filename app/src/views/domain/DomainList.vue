<script setup lang="ts">
import { useStoreGetters } from '@/store/utils'
import { computed, ref } from 'vue'

import RecursiveListGroup from '@/components/RecursiveListGroup.vue'
import { useInitialQueries } from '@/composables/useInitialQueries'
import type { TreeRootNode } from '@/helpers/data/tree'

const { domains, mainDomain, domainsTree } = useStoreGetters()
const { loading } = useInitialQueries([
  ['GET', { uri: 'domains', storeKey: 'domains' }],
])

const search = ref('')

const tree = computed(() => {
  // FIXME rm ts type when moved to pinia or else
  const tree = domainsTree.value as TreeRootNode | undefined
  if (!tree) return
  const search_ = search.value.toLowerCase()
  if (search_) {
    return tree.filter((node) => node.id.includes(search_))
  }
  return tree
})

const hasFilteredItems = computed(() => {
  if (!tree.value) return null
  return tree.value.children.length ? tree.value.children : null
})
</script>

<template>
  <ViewSearch
    id="domain-list"
    v-model:search="search"
    :filtered-items="hasFilteredItems"
    :items="domains"
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
      v-if="tree"
      :tree="tree"
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
              :title="$t('domain.types.main_domain')"
              class="ms-1"
              v-b-tooltip.hover
            >
              <YIcon iname="star" />
            </small>
          </h5>
        </div>
      </template>
    </RecursiveListGroup>
  </ViewSearch>
</template>
