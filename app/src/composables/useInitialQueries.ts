import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { ref, toValue } from 'vue'

import type { APIQuery } from '@/api/api'
import api from '@/api/api'
import type { Obj } from '@/types/commons'

export function useInitialQueries<
  ResponsesType extends (Obj | string)[] = Obj[],
>(
  queries: MaybeRefOrGetter<APIQuery[]> | ComputedRef<APIQuery[]>,
  {
    onQueriesResponse,
    wait = false,
  }: {
    onQueriesResponse?: (...responses: ResponsesType) => Promise<void> | void
    wait?: boolean
  } = {},
) {
  const loading = ref(true)
  const responses: Ref<ResponsesType | null> = ref(null)
  // FIXME watch `queries` to call on change?

  function call(triggerLoading = true) {
    if (triggerLoading) loading.value = true
    return api
      .fetchAll(toValue(queries), { wait, initial: true })
      .then(async (responses_) => {
        responses.value = responses_ as ResponsesType
        if (onQueriesResponse) {
          await onQueriesResponse(...(responses_ as ResponsesType))
        }
        loading.value = false
        return responses
      })
  }

  call()

  return { loading, responses, refetch: call }
}
