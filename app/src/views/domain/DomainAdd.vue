<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { DomainForm } from '@/views/_partials'

const router = useRouter()

const serverError = ref('')

function onSubmit(data: {
  domain: string
  dyndns_recovery_password?: string
  install_letsencrypt_cert?: boolean
}) {
  api
    .post({
      uri: 'domains',
      cachePath: `domains.${data.domain}`,
      data,
      humanKey: { key: 'domains.add', name: data.domain },
    })
    .then(() => {
      router.push({ name: 'domain-list' })
    })
    .catch((err: APIError) => {
      if (!(err instanceof APIBadRequestError)) throw err
      serverError.value = err.message
    })
}
</script>

<template>
  <DomainForm
    :title="$t('domain_add')"
    :server-error="serverError"
    :submit-text="$t('add')"
    @submit="onSubmit"
  />
</template>
