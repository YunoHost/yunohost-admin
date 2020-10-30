<template lang="html">
  <domain-form
    :title="$t('domain_add')" :server-error="serverError"
    @submit="onSubmit" :submit-text="$t('add')"
  />
</template>

<script>
import { DomainForm } from '@/components/reusableForms'

export default {
  name: 'DomainAdd',

  data () {
    return {
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

  components: {
    DomainForm
  }
}
</script>
