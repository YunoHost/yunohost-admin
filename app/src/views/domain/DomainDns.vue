<template>
  <div class="domain-dns">
    <p class="alert alert-warning">
      <icon iname="warning" /> {{ $t('domain_dns_conf_is_just_a_recommendation') }}
    </p>
    <b-card>
      <template v-slot:header>
        <h2><icon iname="globe" /> {{ $t('domain_dns_config') }}</h2>
      </template>
      <pre><code>{{ dnsConfig }}</code></pre>
    </b-card>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'DomainDns',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      dnsConfig: ''
    }
  },
  created () {
    // simply use the api helper since we will not store the request's result.
    api.get(`domains/${this.name}/dns`).then(dnsConfig => {
      this.dnsConfig = dnsConfig
    })
  }
}
</script>

<style lang="scss" scoped>
</style>
