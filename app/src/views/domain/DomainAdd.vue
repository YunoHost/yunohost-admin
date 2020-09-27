<template lang="html">
  <domain-form
    :title="$t('domain_add')"
    :error="error" :is-valid="isValid"
    @submit="onSubmit"
  />
</template>

<script>
import { DomainForm } from '@/components/reusableForms'

export default {
  name: 'DomainAdd',

  data () {
    return {
      isValid: {
        domainname: undefined,
        dynDomainname: undefined
      },
      error: {
        domain: '',
        dynDomain: ''
      }
    }
  },

  methods: {
    onSubmit ({ domain, domainType }) {
      const query = {
        uri: 'domains' + (domainType === 'dynDomain' ? '?dyndns' : ''),
        data: { domain: domain },
        storeKey: 'domains'
      }

      this.$store.dispatch('POST', query).then(() => {
        this.$router.push({ name: 'domain-list' })
      }).catch(error => {
        this.error[domainType] = error.message
        this.isValid[domainType] = false
      })
    }
  },

  components: {
    DomainForm
  }
}
</script>
