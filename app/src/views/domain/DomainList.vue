<template>
  <ViewSearch
    id="domain-list"
    v-model:search="search"
    :items="domains"
    items-name="domains"
    :queries="queries"
    :filtered-items="hasFilteredItems"
  >
    <template #top-bar-buttons>
      <BButton variant="success" :to="{ name: 'domain-add' }">
        <YIcon iname="plus" />
        {{ $t('domain_add') }}
      </BButton>
    </template>

    <RecursiveListGroup
      :tree="tree"
      :toggle-text="$t('domain.toggle_subdomains')"
      class="mb-5"
    >
      <template #default="{ data, parent }">
        <div class="w-100 d-flex justify-content-between align-items-center">
          <h5 class="me-3">
            <BLink :to="data.to" class="text-body text-decoration-none">
              <span class="font-weight-bold">
                {{ data.name.replace(parent ? parent.data.name : null, '') }}
              </span>
              <span v-if="parent" class="text-secondary">
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

<script>
import { mapGetters } from 'vuex'

import RecursiveListGroup from '@/components/RecursiveListGroup.vue'

export default {
  name: 'DomainList',

  components: {
    RecursiveListGroup,
  },

  data() {
    return {
      queries: [['GET', { uri: 'domains', storeKey: 'domains' }]],
      search: '',
    }
  },

  computed: {
    ...mapGetters(['domains', 'mainDomain', 'domainsTree']),

    tree() {
      if (!this.domainsTree) return
      if (this.search) {
        const search = this.search.toLowerCase()
        return this.domainsTree.filter((node) =>
          node.data.name.includes(search),
        )
      }
      return this.domainsTree
    },

    hasFilteredItems() {
      if (!this.tree) return
      return this.tree.children || null
    },
  },
}
</script>
