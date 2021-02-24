<template>
  <view-base :queries="queries" skeleton="card-form-skeleton">
    <domain-form
      :title="$t('domain_add')" :server-error="serverError"
      @submit="onSubmit" :submit-text="$t('add')"
    />
  </view-base>
</template>

<script>
import api from '@/api'
import { DomainForm } from '@/views/_partials'

export default {
  name: 'DomainAdd',

  data () {
    return {
      queries: [
        ['GET', { uri: 'domains' }]
      ],
      serverError: ''
    }
  },

  methods: {
    onSubmit ({ domain, domainType }) {
      const uri = 'domains' + (domainType === 'dynDomain' ? '?dyndns' : '')
      api.post(
        { uri, storeKey: 'domains' },
        { domain }
      ).then(() => {
        this.$router.push({ name: 'domain-list' })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        this.serverError = err.message
      })
    }
  },

  components: { DomainForm }
}
</script>
