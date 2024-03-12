<template>
  <ViewBase :queries="queries" skeleton="CardFormSkeleton">
    <DomainForm
      :title="$t('domain_add')"
      :server-error="serverError"
      @submit="onSubmit"
      :submit-text="$t('add')"
    />
  </ViewBase>
</template>

<script>
import api from '@/api'
import { DomainForm } from '@/views/_partials'

export default {
  name: 'DomainAdd',

  data() {
    return {
      queries: [['GET', { uri: 'domains' }]],
      serverError: '',
    }
  },

  methods: {
    onSubmit(data) {
      api
        .post('domains', data, { key: 'domains.add', name: data.domain })
        .then(() => {
          this.$store.dispatch('RESET_CACHE_DATA', ['domains'])
          this.$router.push({ name: 'domain-list' })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          this.serverError = err.message
        })
    },
  },

  components: { DomainForm },
}
</script>
