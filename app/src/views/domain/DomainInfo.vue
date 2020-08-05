<template>
  <div class="domain-info">
    <b-card>
      <template v-slot:header>
        <h2><icon iname="globe" /> {{ name }}</h2>
      </template>
      <!-- VISIT -->
      <p>{{ $t('domain_visit_url', { url: 'https://' + name }) }}</p>
      <b-button variant="success" :href="'https://' + name" target="_blank">
        <icon iname="external-link" /> {{ $t('domain_visit') }}
      </b-button>
      <hr>

      <!-- DEFAULT DOMAIN -->
      <p>{{ $t('domain_default_desc') }}</p>
      <template v-if="isMainDomain">
        <p class="alert alert-info">
          <icon iname="star" /> {{ $t('domain_default_longdesc') }}
        </p>
      </template>
      <template v-else>
        <b-button variant="info" v-b-modal.default-domain-modal>
          <icon iname="star" /> {{ $t('set_default') }}
        </b-button>
      </template>
      <hr>

      <!-- DNS CONFIG -->
      <p>{{ $t('domain_dns_longdesc') }}</p>
      <b-button :to="{ name: 'domain-dns', param: { name } }">
        <icon iname="globe" /> {{ $t('domain_dns_config') }}
      </b-button>
      <hr>

      <!-- SSL CERTIFICATE -->
      <p>{{ $t('certificate_manage') }}</p>
      <b-button :to="{ name: 'domain-certificate', param: { name } }">
        <icon iname="lock" /> {{ $t('ssl_certificate') }}
      </b-button>
      <hr>

      <!-- DELETE -->
      <p>{{ $t('domain_delete_longdesc') }}</p>
      <b-button variant="danger" v-b-modal.delete-modal>
        <icon iname="trash-o" /> {{ $t('delete') }}
      </b-button>
    </b-card>

    <!-- DEFAULT DOMAIN MODAL -->
    <b-modal
      id="default-domain-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="setAsDefaultDomain" hide-header
    >
      {{ $t('confirm_change_maindomain') }}
    </b-modal>

    <!-- DELETE MODAL -->
    <b-modal
      id="delete-modal" centered
      body-bg-variant="danger" body-text-variant="light"
      @ok="deleteDomain" hide-header
    >
      {{ $t('confirm_delete', { name }) }}
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'DomainInfo',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      purge: false
    }
  },
  computed: {
    mainDomain () {
      return this.$store.state.data.main_domain
    },

    isMainDomain () {
      if (!this.mainDomain) return
      return this.name === this.mainDomain
    }
  },
  methods: {
    deleteDomain () {
      this.$store.dispatch('DELETE',
        { uri: 'domains', param: this.name }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      })
    },

    setAsDefaultDomain () {
      this.$store.dispatch('PUT',
        { uri: 'domains/main', data: { new_main_domain: this.name }, storeKey: 'main_domain' }
      ).then(data => {
        console.log(data)
      }).catch(() => {
        // FIXME PUT /domains/main return empty text response instead of json
        // commit from here for now
        this.$store.commit('UPDATE_MAIN_DOMAIN', this.name)
      })
    }
  },
  created () {
    this.$store.dispatch('FETCH',
      { uri: 'domains/main', storeKey: 'main_domain' }
    )
  }
}
</script>

<style lang="scss" scoped>
.card-body > div {
  flex-direction: column;
  @include media-breakpoint-up(md) {
      flex-direction: row;
  }
}

.icon.fa-user {
  font-size: 10rem;
  padding-right: 3rem;
  padding-left: 1.75rem;
}

.row {
  + .row {
      border-top: 1px solid #eee;
  }

  padding: .5rem;
}

.col {
  margin: 0;
}

ul {
  margin: 0;
  padding: 0;

  li {
    font-style: italic;
    list-style: none;
  }
}

.skeleton {
  opacity: 0.5;

  h2 {
    height: #{2 * 1.2}rem;
  }

  .col {
    & > * {
      display: block;
      background-color: $skeleton-color;
      height: 1.5rem;
      max-width: 8rem;
    }

    strong {
      max-width: 12rem;
    }
  }

  button {
    height: calc(2.25rem + 2px);
    width: 7rem;
  }
}
</style>
