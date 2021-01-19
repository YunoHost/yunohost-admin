<template>
  <view-base :queries="queries" skeleton="card-form-skeleton">
    <domain-form
      :title="$t('domain_add')" :server-error="serverError"
      @submit="onSubmit" :submit-text="$t('add')"
    />
  </view-base>
</template>

<script>
import { DomainForm } from '@/components/reusableForms'

export default {
  name: 'DomainAdd',

  data () {
    return {
      queries: [{ uri: 'domains' }],
      serverError: ''
    }
  },

  methods: {
    onSubmit ({ domain, domainType }) {
      const query = {
        uri: 'domains' + (domainType === 'dynDomain' ? '?dyndns' : ''),
        data: { domain },
        storeKey: 'domains'
      }

      this.$store.dispatch('POST', query).then(() => {
        this.$router.push({ name: 'domain-list' })
      }).catch(error => {
        this.serverError = error.message
      })
    }
  },

  components: { DomainForm }
}
</script>
