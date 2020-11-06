<template lang="html">
  <div class="domain-list">
    <div class="actions">
      <b-input-group>
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>
        <b-form-input id="search-domain" v-model="search" :placeholder="$t('search.domain')" />
      </b-input-group>
      <div class="buttons">
        <b-button variant="success" :to="{name: 'domain-add'}">
          <icon iname="plus" /> {{ $t('domain_add') }}
        </b-button>
      </div>
    </div>

    <b-list-group v-if="filteredDomains">
      <b-list-group-item
        v-for="domain in filteredDomains" :key="domain"
        :to="{ name: 'domain-info', params: { name: domain }}"
        class="d-flex justify-content-between align-items-center pr-0"
      >
        <div>
          <h5>
            {{ domain }}
            <small v-if="domain === mainDomain">
              <span class="sr-only">{{ $t('words.default') }}</span>
              <icon iname="star" :title="$t('words.default')" />
            </small>
          </h5>
          <p>https://{{ domain }}</p>
        </div>
        <icon iname="chevron-right" class="lg fs-sm ml-auto" />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'DomainList',

  data: () => ({
    search: ''
  }),

  computed: {
    filteredDomains () {
      const domains = this.$store.state.data.domains
      const mainDomain = this.mainDomain
      if (!domains || !mainDomain) return
      const search = this.search.toLowerCase()
      return domains
        .filter(name => name.toLowerCase().includes(search))
        .sort(prevDomain => prevDomain === mainDomain ? -1 : 1)
    },

    mainDomain () {
      return this.$store.state.data.main_domain
    }
  },

  methods: {
  },

  created () {
    this.$store.dispatch('FETCH_ALL', [
      { uri: 'domains/main', storeKey: 'main_domain' },
      { uri: 'domains' }
    ])
  }
}
</script>

<style lang="scss" scoped>
p {
  margin: 0
}

.skeleton {
  @each $i, $opacity in 1 .75, 2 .5, 3 .25 {
    .list-group-item:nth-child(#{$i}) { opacity: $opacity; }
  }

  h5, p {
    background-color: $skeleton-color;
    height: 1.5rem;
    width: 10rem;
  }

  small {
    display: none;
  }
}
</style>
