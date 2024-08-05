import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { ref, toValue } from 'vue'

import type { APIQuery } from '@/api/api'
import api from '@/api/api'

export function useInitialQueries<T extends any[] = any[]>(
  queries: MaybeRefOrGetter<APIQuery[]> | ComputedRef<APIQuery[]>,
  {
    onQueriesResponse,
    showModal = false,
  }: {
    onQueriesResponse?: (...responses: T) => Promise<void> | void
    showModal?: boolean
  } = {},
) {
  const loading = ref(true)
  const responses: Ref<T | null> = ref(null)
  // FIXME watch `queries` to call on change?

  function call(triggerLoading = true) {
    if (triggerLoading) loading.value = true
    return api
      .fetchAll<T>(toValue(queries), { showModal, initial: true })
      .then(async (responses_) => {
        responses.value = responses_
        if (onQueriesResponse) {
          await onQueriesResponse(...responses_)
        }
        loading.value = false
        return responses
      })
  }

  call()

  return { loading, responses, refetch: call }
}
