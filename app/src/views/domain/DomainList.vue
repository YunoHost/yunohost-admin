<template>
  <view-search
    id="domain-list"
    :search.sync="search"
    :items="domains"
    :filtered-items="filteredDomains"
    items-name="domains"
    :queries="queries"
  >
    <template #top-bar-buttons>
      <b-button variant="success" :to="{ name: 'domain-add' }">
        <icon iname="plus" />
        {{ $t('domain_add') }}
      </b-button>
    </template>

    <b-list-group>
      <b-list-group-item
        v-for="domain in filteredDomains" :key="domain"
        :to="{ name: 'domain-info', params: { name: domain }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5 class="font-weight-bold">
            {{ domain }}
            <small v-if="domain === mainDomain">
              <span class="sr-only">{{ $t('words.default') }}</span>
              <icon iname="star" :title="$t('words.default')" />
            </small>
          </h5>
          <p class="font-italic m-0">
            https://{{ domain }}
          </p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </view-search>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DomainList',

  data () {
    return {
      queries: [
        { uri: 'domains/main', storeKey: 'main_domain' },
        { uri: 'domains' }
      ],
      search: ''
    }
  },

  computed: {
    ...mapGetters(['domains', 'mainDomain']),

    filteredDomains () {
      if (!this.domains || !this.mainDomain) return
      const search = this.search.toLowerCase()
      const mainDomain = this.mainDomain
      const domains = this.domains
        .filter(name => name.toLowerCase().includes(search))
        .sort(prevDomain => prevDomain === mainDomain ? -1 : 1)
      return domains.length ? domains : null
    }
  }
}
</script>
