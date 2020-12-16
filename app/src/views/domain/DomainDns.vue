<template>
  <view-base :queries="queries" @queries-response="dnsConfig = $event" skeleton="card-info-skeleton">
    <template #top>
      <p class="alert alert-warning">
        <icon iname="warning" /> {{ $t('domain_dns_conf_is_just_a_recommendation') }}
      </p>
    </template>

    <card :title="$t('domain_dns_config')" icon="globe" no-body>
      <pre class="log"><code>{{ dnsConfig }}</code></pre>
    </card>
  </view-base>
</template>

<script>
export default {
  name: 'DomainDns',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [`domains/${this.name}/dns`],
      dnsConfig: ''
    }
  }
}
</script>
