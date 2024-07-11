import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

import type {
  AnyWritableComponents,
  FormField,
  FormFieldDict,
} from '@/types/form'

export function useStoreGetters() {
  const store = useStore()
  return Object.fromEntries(
    Object.keys(store.getters).map((getter) => [
      getter,
      computed(() => store.getters[getter]),
    ]),
  )
}

/**
 * Dynamicly generate computed properties from store with get/set and automatic commit/dispatch
 */
export function useMapStoreGetSet<FFD extends FormFieldDict>({
  commit = [],
  dispatch = [],
}: {
  commit: Extract<keyof FFD, string>[]
  dispatch: Extract<keyof FFD, string>[]
}) {
  const store = useStore()
  type Types = {
    [k in keyof FFD]: FFD[k] extends
      | FormField<AnyWritableComponents, infer MV>
      | undefined
      ? MV
      : any
  }
  return [...commit, ...dispatch].reduce(
    (obj, prop) => {
      obj[prop] = computed<Types[typeof prop]>({
        get() {
          return store.getters[prop]
        },
        set(value) {
          const isCommit = commit.includes(prop)
          const key = (isCommit ? 'SET_' : 'UPDATE_') + prop.toUpperCase()
          store[isCommit ? 'commit' : 'dispatch'](key, value)
        },
      })
      return obj
    },
    {} as { [k in keyof FFD]: WritableComputedRef<any> },
  ) as {
    [k in keyof FFD]: WritableComputedRef<Types[k]>
  }
}
