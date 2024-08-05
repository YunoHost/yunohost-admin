<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api'
import { APIBadRequestError, type APIError } from '@/api/errors'
import { useInitialQueries } from '@/composables/useInitialQueries'
import { DomainForm } from '@/views/_partials'

const router = useRouter()

const { loading } = useInitialQueries([
  { uri: 'domains', cachePath: 'domains' },
])
const serverError = ref('')

function onSubmit(data) {
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
  <ViewBase :loading="loading" skeleton="CardFormSkeleton">
    <DomainForm
      :title="$t('domain_add')"
      :server-error="serverError"
      @submit="onSubmit"
      :submit-text="$t('add')"
    />
  </ViewBase>
</template>
