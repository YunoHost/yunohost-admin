<template>
  <ViewSearch
    id="domain-list"
    :search.sync="search"
    :items="domains"
    items-name="domains"
    :queries="queries"
    :filtered-items="hasFilteredItems"
    @queries-response="onQueriesResponse"
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
          <h5 class="mr-3">
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
              class="ml-1"
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
      domainsTree: undefined,
    }
  },

  computed: {
    ...mapGetters(['domains', 'mainDomain']),

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

  methods: {
    onQueriesResponse() {
      // Add the tree to `data` to make it reactive
      this.domainsTree = this.$store.getters.domainsTree
    },
  },
}
</script>
